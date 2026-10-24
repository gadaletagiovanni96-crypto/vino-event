const router = require('express').Router();
const User = require('../models/User');
const Message = require('../models/Message');
const { auth, requireRole } = require('../middleware/auth');

// Admin: elenco fornitori con ultimo messaggio
router.get('/threads', auth, requireRole('admin'), async (req, res, next) => {
  try {
    const suppliers = await User.find({ role: 'supplier' }).select('name email company');
    const last = await Message.aggregate([{ $sort: { createdAt: -1 } }, { $group: { _id: '$supplier', text: { $first: '$text' }, at: { $first: '$createdAt' } } }]);
    const map = new Map(last.map((l) => [String(l._id), l]));
    res.json(suppliers.map((s) => ({ supplier: s, lastText: map.get(s.id)?.text || null, lastAt: map.get(s.id)?.at || null }))
      .sort((a, b) => (b.lastAt || 0) - (a.lastAt || 0)));
  } catch (e) { next(e); }
});

// Messaggi di una conversazione: l'admin indica l'id, il fornitore usa "me"
router.get('/:supplierId', auth, requireRole('admin', 'supplier'), async (req, res, next) => {
  try {
    const sid = req.user.role === 'supplier' ? req.user.id : req.params.supplierId;
    if (req.user.role === 'supplier' && req.params.supplierId !== 'me' && req.params.supplierId !== req.user.id)
      return res.status(403).json({ message: 'Non autorizzato' });
    res.json(await Message.find({ supplier: sid }).sort('createdAt').limit(500));
  } catch (e) { next(e); }
});

module.exports = router;
