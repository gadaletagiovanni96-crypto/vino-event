const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  standType: { type: mongoose.Schema.Types.ObjectId, ref: 'StandType' },
  standName: String,
  price: Number,
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
}, { timestamps: true });
module.exports = mongoose.model('StandBooking', schema);
