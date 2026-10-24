const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  kind: { type: String, enum: ['ticket', 'stand'], required: true },
  items: [{ label: String, quantity: Number, unitPrice: Number }],
  total: Number,
  cardLast4: String, // MAI il numero completo
}, { timestamps: true });
module.exports = mongoose.model('Order', schema);
