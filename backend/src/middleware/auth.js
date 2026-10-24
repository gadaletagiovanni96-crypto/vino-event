const passport = require('passport');
const auth = passport.authenticate('jwt', { session: false });
const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role) ? next() : res.status(403).json({ message: 'Non hai i permessi per questa operazione' });
module.exports = { auth, requireRole };
