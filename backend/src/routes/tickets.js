const router = require('express').Router();
const { randomUUID } = require('crypto');
const Event = require('../models/Event');
const Order = require('../models/Order');
const Ticket = require('../models/Ticket');
const { auth, requireRole } = require('../middleware/auth');
const { getEvent } = require('../services/defaults');
const { validateCard } = require('../services/payment');
const { sendTicketsEmail } = require('../services/mailer');
const { broadcast } = require('../services/stats');

const MAX_PER_ORDER = 10;
const bad = (res, status, message) => res.status(status).json({ message });

// Checkout del carrello (solo utenti)
router.post('/checkout', auth, requireRole('user'), async (req, res, next) => {
  try {
    const { items, card } = req.body;
    if (!Array.isArray(items) || !items.length) return bad(res, 400, 'Il carrello è vuoto');
    const last4 = validateCard(card);

    const ev = await getEvent();
    const lines = []; let qty = 0; let total = 0;
    for (const it of items) {
      const type = ev.ticketTypes.id(it.typeId);
      const q = parseInt(it.quantity, 10);
      if (!type || !(q > 0)) return bad(res, 400, 'Carrello non valido');
      lines.push({ type, q }); qty += q; total += type.price * q;
    }
    if (qty > MAX_PER_ORDER) return bad(res, 400, `Massimo ${MAX_PER_ORDER} biglietti per ordine`);

    // aggiornamento ATOMICO: evita overselling con acquisti concorrenti
    const updated = await Event.findOneAndUpdate(
      { _id: ev._id, salesOpen: true, soldTickets: { $lte: ev.maxTickets - qty } },
      { $inc: { soldTickets: qty } }, { new: true });
    if (!updated) {
      const fresh = await getEvent();
      if (!fresh.salesOpen) return bad(res, 403, 'Le vendite sono chiuse');
      return bad(res, 409, fresh.soldTickets >= fresh.maxTickets ? 'Biglietti esauriti (sold out)' : `Disponibili solo ${fresh.maxTickets - fresh.soldTickets} biglietti`);
    }

    const order = await Order.create({
      user: req.user.id, kind: 'ticket', total, cardLast4: last4,
      items: lines.map(({ type, q }) => ({ label: type.name, quantity: q, unitPrice: type.price })),
    });
    const tickets = await Ticket.insertMany(lines.flatMap(({ type, q }) =>
      Array.from({ length: q }, () => ({ owner: req.user.id, order: order.id, typeName: type.name, price: type.price, code: randomUUID() }))));

    sendTicketsEmail(req.user, tickets, updated).catch((e) => console.error('Errore invio email:', e.message));
    broadcast(req.app.get('io')).catch(console.error);
    res.status(201).json({ order, tickets });
  } catch (e) { next(e); }
});

// Bacheca dell'utente
router.get('/mine', auth, requireRole('user'), async (req, res, next) => {
  try { res.json(await Ticket.find({ owner: req.user.id }).sort('-createdAt')); } catch (e) { next(e); }
});

// Operatore/admin: informazioni su un biglietto scansionato
router.get('/verify/:code', auth, requireRole('operator', 'admin'), async (req, res, next) => {
  try {
    const t = await Ticket.findOne({ code: req.params.code }).populate('owner', 'name email').populate('checkedInBy', 'name');
    if (!t) return bad(res, 404, 'Biglietto non trovato');
    res.json(t);
  } catch (e) { next(e); }
});

// Operatore/admin: convalida l'ingresso (una sola volta)
router.post('/checkin/:code', auth, requireRole('operator', 'admin'), async (req, res, next) => {
  try {
    const t = await Ticket.findOneAndUpdate(
      { code: req.params.code, checkedIn: false },
      { checkedIn: true, checkedInAt: new Date(), checkedInBy: req.user.id }, { new: true })
      .populate('owner', 'name email');
    if (!t) return bad(res, 409, 'Biglietto inesistente o già utilizzato');
    broadcast(req.app.get('io')).catch(console.error);
    res.json(t);
  } catch (e) { next(e); }
});

module.exports = router;
