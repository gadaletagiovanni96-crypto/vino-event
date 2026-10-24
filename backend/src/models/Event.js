const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  title: String,
  subtitle: String,
  description: String,
  date: Date,
  location: String,
  program: [{ time: String, title: String, description: String }],
  ticketTypes: [{ name: String, description: String, price: Number }],
  maxTickets: { type: Number, default: 200 },
  soldTickets: { type: Number, default: 0 },
  salesOpen: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('Event', schema);
