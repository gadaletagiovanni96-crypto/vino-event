# Documentazione – Calici & Colline

## 1. Scenario applicativo
Calici & Colline è un festival del vino. L'applicazione gestisce le prenotazioni e l'organizzazione dell'evento per quattro attori:

| Attore | Cosa fa |
|---|---|
| **Utente** | Si registra, aggiunge i biglietti al carrello, paga (carta simulata), li ritrova nella bacheca e via email con QR code. |
| **Fornitore** | Accede, chatta in tempo reale con l'amministratore per presentare i prodotti e acquista uno stand tra più tipologie (prezzo e visibilità diversi). |
| **Operatore** | All'ingresso scansiona il QR del biglietto, vede chi lo ha acquistato e convalida l'ingresso (un biglietto vale una sola volta). |
| **Amministratore** | Apre/chiude le vendite, imposta il numero di biglietti vendibili (con segnalazione di sold-out), consulta in tempo reale contabilità, stand, biglietti e chat con i fornitori. |

La **pagina iniziale** pubblica mostra descrizione, programma, luogo, data, biglietti disponibili e prezzi; si aggiorna in tempo reale (sold out, vendite chiuse).

## 2. Architettura
```
React (Vite, MUI, React Router, Context, Axios, socket.io-client)
        │  HTTP/JSON (Bearer access token)      WebSocket (Socket.IO, token JWT)
        ▼
Express + Passport (local-login, local-register, jwt) + Socket.IO
        │  Mongoose
        ▼
MongoDB Atlas
```
**Autenticazione e sessione (strategia ibrida access + session token):**
- password con hash **bcrypt** (12 round);
- **Passport**: `local-login`, `local-register` (valida ruolo e codici d'invito per operatore/admin) e `jwt` (protezione API);
- *access token* JWT (15 min) tenuto in memoria dal frontend e inviato come `Authorization: Bearer`;
- *session (refresh) token* JWT (7 giorni) in cookie `httpOnly`; ne viene salvato solo l'hash SHA-256 in `User.sessions` e **ruota** a ogni rinnovo, così il logout lo invalida lato server;
- autorizzazione per ruolo con il middleware `requireRole(...)`.

**Real-time (Socket.IO):** i socket si autenticano con l'access token. Evento `event:update` a tutti (disponibilità, sold-out, vendite aperte/chiuse), `stats:update` alla stanza `admins` (contabilità), `chat:message` alle stanze `supplier:<id>` e `admins`.

**Concorrenza:** il conteggio dei biglietti e degli stand usa aggiornamenti atomici (`findOneAndUpdate` con condizione), quindi non è possibile vendere più di quanto disponibile anche con acquisti simultanei.

**Pagamento simulato:** il backend valida il formato della carta e salva solo le ultime 4 cifre.

## 3. Casi d'uso (UML)
Sorgente PlantUML in `docs/use-cases.puml` (renderizzabile su plantuml.com o con l'estensione PlantUML di VS Code).

Sequenza dell'acquisto biglietti:
```
Utente → Frontend : Paga carrello (items, carta)
Frontend → API : POST /api/tickets/checkout (Bearer)
API : valida carta, controlla vendite aperte
API → MongoDB : Event.findOneAndUpdate(soldTickets += n) [atomico]
API → MongoDB : crea Order e Ticket (UUID = contenuto del QR)
API → Mailer : email con QR allegati (asincrona)
API → Socket.IO : event:update (tutti) + stats:update (admin)
API → Frontend : 201 {order, tickets}
```

## 4. Modello dei dati (MongoDB)
| Collezione | Campi principali |
|---|---|
| **User** | name, email (unico), password (hash), role (`admin/user/operator/supplier`), company (fornitori), sessions[] (hash refresh token) |
| **Event** (unico documento) | title, subtitle, description, date, location, program[], ticketTypes[{name, description, price}], maxTickets, soldTickets, salesOpen |
| **Ticket** | code (UUID, nel QR), owner→User, order→Order, typeName, price, checkedIn, checkedInAt, checkedInBy→User |
| **Order** | user→User, kind (`ticket/stand`), items[{label, quantity, unitPrice}], total, cardLast4 — è la base della contabilità |
| **StandType** | name, price, visibility, description, level, quantity, sold |
| **StandBooking** | supplier→User, standType→StandType, standName, price, order→Order (un solo stand per fornitore) |
| **Message** | supplier→User (identifica la conversazione), sender→User, senderRole, senderName, text |

Relazioni: User 1–N Ticket, User 1–N Order, Order 1–N Ticket, User(supplier) 1–1 StandBooking, User(supplier) 1–N Message.

## 5. API backend
Documentazione completa e provabile con **Swagger UI** su `http://localhost:4000/api-docs`. Riepilogo:

| Metodo e percorso | Ruolo | Descrizione |
|---|---|---|
| POST `/api/auth/register` | pubblico | Registrazione (user, supplier, operator*, admin*) — *richiedono codice d'invito |
| POST `/api/auth/login` | pubblico | Login, restituisce access token e imposta il cookie di sessione |
| POST `/api/auth/refresh` | cookie | Rinnova l'access token e ruota il session token |
| POST `/api/auth/logout` | cookie | Invalida la sessione |
| GET `/api/auth/me` | autenticato | Utente corrente |
| GET `/api/event` | pubblico | Info evento, disponibilità, sold-out |
| PUT `/api/event` | admin | Apre/chiude vendite, imposta biglietti vendibili, modifica info |
| POST `/api/tickets/checkout` | user | Acquisto del carrello |
| GET `/api/tickets/mine` | user | Bacheca biglietti |
| GET `/api/tickets/verify/:code` | operator, admin | Dati del biglietto e dell'acquirente |
| POST `/api/tickets/checkin/:code` | operator, admin | Convalida ingresso |
| GET `/api/stands` | supplier, admin | Tipologie di stand e disponibilità |
| GET `/api/stands/mine` | supplier | Stand acquistato |
| POST `/api/stands/:id/purchase` | supplier | Acquisto stand |
| PUT `/api/stands/:id` | admin | Modifica prezzo/quantità/visibilità |
| GET `/api/admin/stats` | admin | Contabilità, biglietti, stand, ordini |
| GET `/api/chat/threads` | admin | Conversazioni con i fornitori |
| GET `/api/chat/:supplierId` | admin / supplier (`me`) | Storico messaggi |

Eventi Socket.IO: `chat:send` (client→server), `chat:message`, `event:update`, `stats:update` (server→client).

## 6. Componenti React (frontend)
**Contesti (`useContext`)**: `AuthContext` (utente, login, registrazione, logout, ripristino sessione), `SocketContext` (connessione Socket.IO legata all'utente), `CartContext` (carrello biglietti).

**Componenti**: `NavBar` (menu per ruolo, carrello), `ProtectedRoute` (accesso per ruolo con React Router), `CardForm` (form controllato con `useState` per la carta simulata), `ChatBox` (messaggi e invio).

**Pagine**: `Home` (info evento in tempo reale), `Login`, `Register`, `Cart` (carrello + pagamento), `MyTickets` (bacheca con QR), `Stands` (acquisto stand), `SupplierChat`, `Scanner` (scansione QR con camera o codice manuale), `AdminDashboard` (vendite, KPI e tabelle in tempo reale), `AdminChat`.

Stile: Material UI con tema personalizzato (bordeaux/oliva, Fraunces + Public Sans).
