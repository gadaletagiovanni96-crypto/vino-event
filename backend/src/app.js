const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const { passport } = require('./passport');
const { CLIENT_URL } = require('./config');

const app = express();
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(require('./swagger')));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/event', require('./routes/event'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/stands', require('./routes/stands'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', require('./routes/chat'));

app.use('/api', (req, res) => res.status(404).json({ message: 'Risorsa non trovata' }));
app.use((err, req, res, next) => { // gestione errori centralizzata
  if (err.status !== 400 || !err.message) console.error(err);
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Errore interno del server' });
});
module.exports = app;
