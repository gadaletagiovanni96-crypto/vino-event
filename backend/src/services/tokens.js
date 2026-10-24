const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { ACCESS_SECRET, REFRESH_SECRET } = require('../config');

const signAccess = (u) => jwt.sign({ sub: u.id, role: u.role }, ACCESS_SECRET, { expiresIn: '15m' });
const signRefresh = (u) => jwt.sign({ sub: u.id, jti: crypto.randomUUID() }, REFRESH_SECRET, { expiresIn: '7d' });
const verifyRefresh = (t) => jwt.verify(t, REFRESH_SECRET);
const verifyAccess = (t) => jwt.verify(t, ACCESS_SECRET);
const hash = (t) => crypto.createHash('sha256').update(t).digest('hex');

module.exports = { signAccess, signRefresh, verifyRefresh, verifyAccess, hash };
