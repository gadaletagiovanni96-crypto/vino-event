const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // hash bcrypt
  role: { type: String, enum: ['admin', 'user', 'operator', 'supplier'], default: 'user' },
  company: { type: String, trim: true },       // solo fornitori
  sessions: [String],                           // hash SHA-256 dei refresh token attivi
}, { timestamps: true });
module.exports = mongoose.model('User', schema);
