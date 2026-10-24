// Crea gli account di test. Uso: npm run seed
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { MONGO_URI } = require('./config');
const { getEvent, ensureStands } = require('./services/defaults');

(async () => {
  await mongoose.connect(MONGO_URI);
  await getEvent(); await ensureStands();
  const password = await bcrypt.hash('Password123!', 12);
  const demo = [
    { name: 'Admin Evento', email: 'admin@vino.it', role: 'admin' },
    { name: 'Olga Operatrice', email: 'operatore@vino.it', role: 'operator' },
    { name: 'Franco Fornitore', email: 'fornitore@vino.it', role: 'supplier', company: 'Cantina Fontanelle' },
    { name: 'Ugo Utente', email: 'utente@vino.it', role: 'user' },
  ];
  for (const d of demo) await User.updateOne({ email: d.email }, { $setOnInsert: { ...d, password } }, { upsert: true });
  console.log('Account di test pronti (password: Password123!)');
  await mongoose.disconnect();
})();
