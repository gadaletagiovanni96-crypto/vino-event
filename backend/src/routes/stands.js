const router = require('express').Router();
const StandType = require('../models/StandType');
const StandBooking = require('../models/StandBooking');
const Order = require('../models/Order');
const { auth, requireRole } = require('../middleware/auth');
const { validateCard } = require('../services/payment');
const { broadcast } = require('../services/stats');

const view = (s) => ({ ...s.toObject(), available: s.quantity - s.sold });

router.get('/', auth, requireRole('supplier', 'admin'), async (req, res, next) => {
  try { res.json((await StandType.find().sort('level')).map(view)); } catch (e) { next(e); }
});

router.get('/mine', auth, requireRole('supplier'), async (req, res, next) => {
  try { res.json(await StandBooking.findOne({ supplier: req.user.id })); } catch (e) { next(e); }
});

// Acquisto stand: un fornitore può avere un solo stand
router.post('/:id/purchase', auth, requireRole('supplier'), async (req, res, next) => {
  try {
    const last4 = validateCard(req.body.card);
    if (await StandBooking.findOne({ supplier: req.user.id })) return res.status(409).json({ message: 'Hai già acquistato uno stand' });
    const type = await StandType.findById(req.params.id);
    if (!type) return res.status(404).json({ message: 'Stand non trovato' });

    const updated = await StandType.findOneAndUpdate(
      { _id: type.id, $expr: { $lt: ['$sold', '$quantity'] } }, { $inc: { sold: 1 } }, { new: true }); // atomico
    if (!updated) return res.status(409).json({ message: 'Stand esauriti per questa tipologia' });

    const order = await Order.create({ user: req.user.id, kind: 'stand', total: type.price, cardLast4: last4,
      items: [{ label: `Stand ${type.name}`, quantity: 1, unitPrice: type.price }] });
    const booking = await StandBooking.create({ supplier: req.user.id, standType: type.id, standName: type.name, price: type.price, order: order.id });
    broadcast(req.app.get('io')).catch(console.error);
    res.status(201).json(booking);
  } catch (e) { next(e); }
});

// Admin: modifica prezzo/quantità/visibilità
router.put('/:id', auth, requireRole('admin'), async (req, res, next) => {
  try {
    const { price, quantity, visibility, description } = req.body;
    const s = await StandType.findById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Stand non trovato' });
    if (quantity !== undefined && quantity < s.sold) return res.status(400).json({ message: 'Quantità inferiore agli stand già venduti' });
    Object.assign(s, Object.fromEntries(Object.entries({ price, quantity, visibility, description }).filter(([, v]) => v !== undefined)));
    await s.save();
    broadcast(req.app.get('io')).catch(console.error);
    res.json(view(s));
  } catch (e) { next(e); }
});

module.exports = router;
