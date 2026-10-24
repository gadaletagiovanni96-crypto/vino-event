# Calici & Colline – gestione prenotazioni di un evento di vini

SPA con **React + Material UI** (frontend) e **Node.js + Express + Passport + MongoDB Atlas** (backend), con chat e aggiornamenti in tempo reale via **Socket.IO**.

```
vino-event/
├── backend/    API REST, Passport, Socket.IO, Swagger (/api-docs)
├── frontend/   SPA React (Vite)
└── docs/       Documentazione, casi d'uso UML, modello dati
```

## Avvio

1. Crea un cluster gratuito su **MongoDB Atlas** e copia la stringa di connessione.
2. Backend:
   ```bash
   cd backend
   cp .env.example .env      # inserisci MONGO_URI e i segreti JWT
   npm install
   npm run seed              # crea gli account di test e i dati iniziali
   npm run dev               # http://localhost:4000  (Swagger: /api-docs)
   ```
3. Frontend (altro terminale):
   ```bash
   cd frontend
   npm install
   npm run dev               # http://localhost:5173
   ```

## Credenziali di test (password per tutti: `Password123!`)

| Ruolo | Email |
|---|---|
| Amministratore | admin@vino.it |
| Operatore | operatore@vino.it |
| Fornitore | fornitore@vino.it |
| Utente | utente@vino.it |

Per registrare nuovi account **Operatore** e **Amministratore** dalla pagina di registrazione servono i codici d'invito definiti nel `.env`
(`OPERATOR_INVITE_CODE`, `ADMIN_INVITE_CODE`; default `OPERATORE-2026` e `ADMIN-2026`).

## Email dei biglietti
Se `SMTP_HOST` è vuoto l'invio è simulato (messaggio nel log del backend). Per l'invio reale compila le variabili `SMTP_*`
(es. Gmail con password per app, Brevo, Mailtrap).

## Pagamento
È una **simulazione**: il form della carta è validato nel formato, non viene addebitato nulla e si conservano solo le ultime 4 cifre. Carta di prova: `4242 4242 4242 4242`, scadenza futura, CVV qualsiasi.

## Deployment (suggerito)
Backend su Render (variabili d'ambiente come `.env`, `COOKIE_SAMESITE=none`, `CLIENT_URL` = URL del frontend). Frontend su Vercel/Netlify con `VITE_API_URL` = URL del backend.
