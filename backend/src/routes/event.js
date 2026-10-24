const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const { getEvent, eventView } = require('../services/defaults');
const { broadcast } = require('../services/stats');

router.get('/', async (req, res, next) => {
  try { res.json(eventView(await getEvent())); } catch (e) { next(e); }
});

// Solo admin: apri/chiudi vendite, numero massimo biglietti, informazioni evento
router.put('/', auth, requireRole('admin'), async (req, res, next) => {
  try {
    const ev = await getEvent();
    const { salesOpen, maxTickets, title, subtitle, description, date, location, program, ticketTypes } = req.body;
    if (maxTickets !== undefined) {
      const n = parseInt(maxTickets, 10);
      if (!(n >= ev.soldTickets)) return res.status(400).json({ message: `Il limite non può essere inferiore ai biglietti già venduti (${ev.soldTickets})` });
      ev.maxTickets = n;
    }
    if (salesOpen !== undefined) ev.salesOpen = !!salesOpen;
    Object.assign(ev, Object.fromEntries(Object.entries({ title, subtitle, description, date, location, program, ticketTypes }).filter(([, v]) => v !== undefined)));
    await ev.save();
    await broadcast(req.app.get('io'));
    res.json(eventView(ev));
  } catch (e) { next(e); }
});

module.exports = router;
