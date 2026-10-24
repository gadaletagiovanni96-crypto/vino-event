const Order = require('../models/Order');
const Ticket = require('../models/Ticket');
const StandType = require('../models/StandType');
const StandBooking = require('../models/StandBooking');
const { getEvent, eventView } = require('./defaults');

async function computeStats() {
  const [ev, agg, stands, bookings, tickets, orders, checkedIn] = await Promise.all([
    getEvent(),
    Order.aggregate([{ $group: { _id: '$kind', total: { $sum: '$total' }, count: { $sum: 1 } } }]),
    StandType.find().sort('level'),
    StandBooking.find().populate('supplier', 'name email company').sort('-createdAt'),
    Ticket.find().populate('owner', 'name email').sort('-createdAt').limit(300),
    Order.find().populate('user', 'name email role').sort('-createdAt').limit(100),
    Ticket.countDocuments({ checkedIn: true }),
  ]);
  const rev = (k) => agg.find((a) => a._id === k)?.total || 0;
  return {
    event: eventView(ev),
    revenue: { tickets: rev('ticket'), stands: rev('stand'), total: rev('ticket') + rev('stand') },
    checkedIn,
    stands: stands.map((s) => ({ ...s.toObject(), available: s.quantity - s.sold })),
    bookings, tickets, orders,
  };
}

// Notifica in tempo reale: evento a tutti, statistiche agli admin
async function broadcast(io) {
  const ev = await getEvent();
  io.emit('event:update', eventView(ev));
  io.to('admins').emit('stats:update', await computeStats());
}
module.exports = { computeStats, broadcast };
