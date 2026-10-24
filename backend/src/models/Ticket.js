const mongoose = require('mongoose');
const { randomUUID } = require('crypto');
const schema = new mongoose.Schema({
  code: { type: String, unique: true, default: () => randomUUID() }, // contenuto del QR
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  typeName: String,
  price: Number,
  checkedIn: { type: Boolean, default: false },
  checkedInAt: Date,
  checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
module.exports = mongoose.model('Ticket', schema);
