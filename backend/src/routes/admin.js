const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const { computeStats } = require('../services/stats');

router.get('/stats', auth, requireRole('admin'), async (req, res, next) => {
  try { res.json(await computeStats()); } catch (e) { next(e); }
});
module.exports = router;
