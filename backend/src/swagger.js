const sec = [{ bearerAuth: [] }];
const json = (schema) => ({ content: { 'application/json': { schema } } });
const ok = (d, schema) => ({ description: d, ...(schema ? json(schema) : {}) });
const card = { type: 'object', required: ['number', 'name', 'expiry', 'cvv'], properties: { number: { type: 'string', example: '4242 4242 4242 4242' }, name: { type: 'string' }, expiry: { type: 'string', example: '12/29' }, cvv: { type: 'string', example: '123' } } };
const path = (tag, summary, extra = {}) => ({ tags: [tag], summary, security: sec, responses: { 200: ok('OK'), 401: ok('Non autenticato'), 403: ok('Ruolo non autorizzato') }, ...extra });

module.exports = {
  openapi: '3.0.3',
  info: { title: 'Calici & Colline – API', version: '1.0.0', description: 'API REST per la gestione dell\'evento. Autenticazione: access token JWT (Bearer) + refresh token in cookie httpOnly.' },
  servers: [{ url: '/' }],
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
  paths: {
    '/api/auth/register': { post: { tags: ['Auth'], summary: 'Registrazione (user, supplier, operator, admin)', requestBody: json({ type: 'object', required: ['name', 'email', 'password'], properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string', minLength: 8 }, role: { type: 'string', enum: ['user', 'supplier', 'operator', 'admin'] }, company: { type: 'string', description: 'Obbligatorio per supplier' }, inviteCode: { type: 'string', description: 'Obbligatorio per operator e admin' } } }), responses: { 201: ok('Account creato, restituisce accessToken'), 400: ok('Dati non validi') } } },
    '/api/auth/login': { post: { tags: ['Auth'], summary: 'Login', requestBody: json({ type: 'object', required: ['email', 'password'], properties: { email: { type: 'string' }, password: { type: 'string' } } }), responses: { 200: ok('accessToken + cookie refreshToken'), 400: ok('Credenziali non valide') } } },
    '/api/auth/refresh': { post: { tags: ['Auth'], summary: 'Rinnova access token (ruota il refresh token nel cookie)', responses: { 200: ok('Nuovo accessToken'), 401: ok('Sessione non valida') } } },
    '/api/auth/logout': { post: { tags: ['Auth'], summary: 'Chiude la sessione', responses: { 200: ok('OK') } } },
    '/api/auth/me': { get: path('Auth', 'Utente corrente') },
    '/api/event': {
      get: { tags: ['Evento'], summary: 'Informazioni pubbliche sull\'evento, disponibilità e stato sold-out', responses: { 200: ok('Evento') } },
      put: path('Evento', 'Admin: apre/chiude le vendite, imposta il numero massimo di biglietti, modifica le info', { requestBody: json({ type: 'object', properties: { salesOpen: { type: 'boolean' }, maxTickets: { type: 'integer' }, title: { type: 'string' }, description: { type: 'string' } } }) }),
    },
    '/api/tickets/checkout': { post: path('Biglietti', 'User: acquisto del carrello (pagamento simulato)', { requestBody: json({ type: 'object', required: ['items', 'card'], properties: { items: { type: 'array', items: { type: 'object', properties: { typeId: { type: 'string' }, quantity: { type: 'integer' } } } }, card } }) }) },
    '/api/tickets/mine': { get: path('Biglietti', 'User: biglietti nella bacheca') },
    '/api/tickets/verify/{code}': { get: path('Biglietti', 'Operator/Admin: dati del biglietto e dell\'acquirente', { parameters: [{ name: 'code', in: 'path', required: true, schema: { type: 'string' } }] }) },
    '/api/tickets/checkin/{code}': { post: path('Biglietti', 'Operator/Admin: convalida l\'ingresso', { parameters: [{ name: 'code', in: 'path', required: true, schema: { type: 'string' } }] }) },
    '/api/stands': { get: path('Stand', 'Supplier/Admin: tipologie di stand con disponibilità') },
    '/api/stands/mine': { get: path('Stand', 'Supplier: stand acquistato') },
    '/api/stands/{id}/purchase': { post: path('Stand', 'Supplier: acquista uno stand (pagamento simulato)', { parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: json({ type: 'object', properties: { card } }) }) },
    '/api/stands/{id}': { put: path('Stand', 'Admin: modifica prezzo, quantità e visibilità', { parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }] }) },
    '/api/admin/stats': { get: path('Admin', 'Admin: contabilità, biglietti, stand, ordini') },
    '/api/chat/threads': { get: path('Chat', 'Admin: conversazioni con i fornitori') },
    '/api/chat/{supplierId}': { get: path('Chat', 'Admin (id fornitore) / Supplier ("me"): storico messaggi', { parameters: [{ name: 'supplierId', in: 'path', required: true, schema: { type: 'string' } }] }) },
  },
};
