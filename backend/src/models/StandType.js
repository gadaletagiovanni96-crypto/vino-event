const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: String,
  price: Number,
  visibility: String,   // descrizione della visibilità offerta
  description: String,
  level: Number,        // 1 = base ... 3 = premium
  quantity: Number,     // stand disponibili in totale
  sold: { type: Number, default: 0 },
});
module.exports = mongoose.model('StandType', schema);
