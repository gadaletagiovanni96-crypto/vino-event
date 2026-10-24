const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const initSocket = require('./socket');
const { PORT, MONGO_URI } = require('./config');
const { getEvent, ensureStands } = require('./services/defaults');

(async () => {
  if (!MONGO_URI) { console.error('MONGO_URI mancante: copia .env.example in .env'); process.exit(1); }
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connesso');
  await getEvent(); await ensureStands(); // dati iniziali dell'evento

  const server = http.createServer(app);
  app.set('io', initSocket(server));
  server.listen(PORT, () => console.log(`API su http://localhost:${PORT}  |  Swagger su /api-docs`));
})().catch((e) => { console.error(e); process.exit(1); });
