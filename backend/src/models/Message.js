const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // identifica la conversazione
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderRole: { type: String, enum: ['admin', 'supplier'] },
  senderName: String,
  text: { type: String, required: true, maxlength: 1000 },
}, { timestamps: true });
module.exports = mongoose.model('Message', schema);
