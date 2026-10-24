const router = require('express').Router();
const User = require('../models/User');
const { authLocal } = require('../passport');
const { auth } = require('../middleware/auth');
const { signAccess, signRefresh, verifyRefresh, hash } = require('../services/tokens');
const { COOKIE_SAMESITE, PROD } = require('../config');

const cookieOpts = { httpOnly: true, sameSite: COOKIE_SAMESITE, secure: PROD || COOKIE_SAMESITE === 'none', maxAge: 7 * 24 * 3600 * 1000, path: '/api/auth' };
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, company: u.company });

// crea la sessione: access token (breve, nel body) + refresh/session token (lungo, cookie httpOnly)
async function startSession(user, res, oldHash) {
  const refresh = signRefresh(user);
  user.sessions = [...(user.sessions || []).filter((h) => h !== oldHash).slice(-4), hash(refresh)];
  await user.save();
  res.cookie('refreshToken', refresh, cookieOpts);
  return signAccess(user);
}

router.post('/register', authLocal('local-register'), async (req, res, next) => {
  try { res.status(201).json({ accessToken: await startSession(req.user, res), user: publicUser(req.user) }); } catch (e) { next(e); }
});

router.post('/login', authLocal('local-login'), async (req, res, next) => {
  try { res.json({ accessToken: await startSession(req.user, res), user: publicUser(req.user) }); } catch (e) { next(e); }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'Sessione assente' });
    let payload;
    try { payload = verifyRefresh(token); } catch { return res.status(401).json({ message: 'Sessione scaduta' }); }
    const user = await User.findById(payload.sub);
    if (!user || !user.sessions.includes(hash(token))) return res.status(401).json({ message: 'Sessione non valida' });
    res.json({ accessToken: await startSession(user, res, hash(token)), user: publicUser(user) }); // rotazione del token
  } catch (e) { next(e); }
});

router.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      try {
        const { sub } = verifyRefresh(token);
        await User.updateOne({ _id: sub }, { $pull: { sessions: hash(token) } });
      } catch { /* token già scaduto */ }
    }
    res.clearCookie('refreshToken', { ...cookieOpts, maxAge: undefined });
    res.json({ message: 'Disconnesso' });
  } catch (e) { next(e); }
});

router.get('/me', auth, (req, res) => res.json({ user: publicUser(req.user) }));

module.exports = router;
