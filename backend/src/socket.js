const { Server } = require('socket.io');
const User = require('./models/User');
const Message = require('./models/Message');
const { verifyAccess } = require('./services/tokens');
const { CLIENT_URL } = require('./config');

module.exports = function initSocket(httpServer) {
  const io = new Server(httpServer, { cors: { origin: CLIENT_URL, credentials: true } });

  // Autenticazione dei socket con JWT. Gli ospiti possono connettersi ma ricevono solo gli aggiornamenti pubblici dell'evento.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) { socket.user = null; return next(); }
      const p = verifyAccess(token);
      socket.user = await User.findById(p.sub).select('name role company');
      next();
    } catch { socket.user = null; next(); }
  });

  io.on('connection', (socket) => {
    const u = socket.user;
    if (u?.role === 'admin') socket.join('admins');
    if (u?.role === 'supplier') socket.join(`supplier:${u.id}`);

    socket.on('chat:send', async ({ supplierId, text } = {}, ack) => {
      try {
        if (!u || !['admin', 'supplier'].includes(u.role)) return;
        text = String(text || '').trim().slice(0, 1000);
        if (!text) return;
        const sid = u.role === 'supplier' ? u.id : supplierId;
        if (u.role === 'admin' && !(await User.exists({ _id: sid, role: 'supplier' }))) return;
        const msg = await Message.create({ supplier: sid, sender: u.id, senderRole: u.role, senderName: u.role === 'supplier' ? (u.company || u.name) : 'Organizzazione', text });
        io.to(`supplier:${sid}`).to('admins').emit('chat:message', msg);
        ack?.({ ok: true });
      } catch (e) { ack?.({ ok: false }); }
    });
  });
  return io;
};
