# Calici e Colline

Piattaforma per la gestione e l'acquisto dei ticket di un unico evento enoturistico.

Calici e Colline è una Single Page Application (SPA) con client-side rendering. Consente di consultare l'evento, acquistare i biglietti e gestire i ticket digitali con QR Code.


## Indice

1. [Obiettivi](#obiettivi)
2. [Ruoli e credenziali](#ruoli-e-credenziali)
3. [Funzionalità](#funzionalità)
4. [Architettura](#architettura)
5. [Database](#database)
6. [Sicurezza](#sicurezza)
7. [Stack tecnologico](#stack-tecnologico)
8. [Estensioni future](#estensioni-future)

---

## Obiettivi

La piattaforma è dedicata ad un solo evento. Permette di:

- registrarsi e accedere al sistema
- visualizzare i dettagli dell'evento
- acquistare uno o più biglietti
- ricevere i ticket digitali via email di conferma acquisto
- consultare in qualsiasi momento i propri acquisti e i QR Code associati
- per l'amministratore: controllare quanti biglietti sono stati venduti e chi li ha acquistati
- per l'operatore: scansionare un QR Code e verificare se corrisponde a un biglietto venduto

---

## Ruoli e credenziali

L'applicazione distingue tre ruoli. Le credenziali riportate di seguito sono **solo account di prova** e non devono essere utilizzate in produzione.

| Ruolo | Email | Password | Permessi principali |
| --- | --- | --- | --- |
| Amministratore | `admin@vino.it` | `Password123!` | Gestione dell'evento; controllo dei biglietti venduti e degli acquirenti |
| Operatore | `operatore@vino.it` | `Password123!` | Scansione del QR Code per verificare se il biglietto è stato venduto |
| Utente | `utente@vino.it` | `Password123!` | Dettaglio evento, carrello, acquisti e area personale |


---

## Funzionalità

Per ciascuna area sono indicate le tecnologie da usare, in linea con le slide del corso.

### Registrazione e autenticazione

Modalità di accesso:

- registrazione con email e password
- login con credenziali
- accesso OAuth con Google e Apple
- hashing delle password
- mantenimento della sessione dopo il login

L'utente può autenticarsi subito: non viene inviato alcun link di conferma email.

**Tecnologie**

- **Frontend:** React (form controllati con `useState`), React Router (login e registrazione), `useContext` per lo stato di autenticazione, Axios o Fetch, Tailwind CSS
- **Backend:** Node.js ed Express (API REST di registrazione e login), hashing delle password, Passport.js, OAuth
- **Sessione:** JWT e/o cookie di sessione
- **Database:** MongoDB Atlas, collezione Utenti

### Evento

La piattaforma gestisce un unico evento. Gli utenti autenticati possono:

- consultarne titolo, descrizione, data e ora, luogo, prezzo, posti disponibili e immagine promozionale
- verificare la disponibilità dei posti
- selezionare il numero di biglietti
- procedere all'acquisto

L'amministratore può aggiornare i dati dell'evento e la disponibilità dei ticket. Non esistono elenco, filtri o pagine di catalogo.

**Tecnologie**

- **Frontend:** React (`useEffect` per il caricamento dati, rendering condizionale), React Router, Axios o Fetch, Tailwind CSS
- **Backend:** Node.js ed Express (API REST per lettura e aggiornamento dell'evento)
- **Database:** MongoDB Atlas, collezione Eventi (un solo documento)

### Carrello

Il carrello consente di:

- aggiungere ticket per l'evento
- modificare le quantità
- rimuovere ticket
- visualizzare il totale
- confermare l'acquisto

**Tecnologie**

- **Frontend:** React (`useState`, `useContext` per lo stato condiviso), React Router, Tailwind CSS
- **Backend:** Node.js ed Express (API REST per la conferma dell'ordine)
- **Database:** MongoDB Atlas, collezioni Ordini e Ticket (create solo alla conferma dell'acquisto)

### Ticket digitali e QR Code

Al termine dell'acquisto:

- viene generato un ticket digitale univoco
- ogni ticket contiene un QR Code identificativo
- l'utente riceve un'email di conferma con i dettagli dell'ordine
- i ticket restano disponibili nell'area personale

**Tecnologie**

- **Frontend:** React, React Router, Axios o Fetch, Tailwind CSS
- **Backend:** Node.js ed Express (generazione dei ticket e dei QR Code a partire dai codici univoci, invio email di conferma acquisto)
- **Database:** MongoDB Atlas, collezione Ticket

### Area amministratore

L'amministratore dispone di una sezione dedicata in cui può:

- vedere quanti biglietti sono stati venduti
- vedere quanti biglietti risultano ancora disponibili
- consultare l'elenco degli acquirenti (nome, cognome, email)
- vedere, per ciascun acquirente, quanti biglietti ha acquistato e quando

**Tecnologie**

- **Frontend:** React, React Router (rotte protette per ruolo `amministratore`), Axios o Fetch, Tailwind CSS
- **Backend:** Node.js ed Express (API REST autenticate, autorizzazione per ruolo)
- **Database:** MongoDB Atlas, collezioni Ordini, Ticket e Utenti

### Area operatore

L'operatore dispone di una sezione dedicata in cui può:

- scansionare il QR Code di un biglietto (fotocamera o inserimento del codice)
- verificare se il QR Code corrisponde a un biglietto **venduto**
- visualizzare l'esito del controllo (biglietto valido / non trovato)

**Tecnologie**

- **Frontend:** React, React Router (rotte protette per ruolo `operatore`), accesso alla fotocamera per la scansione, Axios o Fetch, Tailwind CSS
- **Backend:** Node.js ed Express (API REST di verifica ticket, autorizzazione per ruolo)
- **Database:** MongoDB Atlas, collezione Ticket. Poiché i ticket vengono creati solo per gli ordini confermati, un codice presente nel database identifica un biglietto venduto.

### Area personale

Nella sezione account l'utente può:

- consultare gli acquisti
- visualizzare i ticket e i QR Code
- vedere lo storico degli ordini

**Tecnologie**

- **Frontend:** React, React Router (rotte protette), `useContext`, Axios con token/cookie, Tailwind CSS
- **Backend:** Node.js ed Express (API REST autenticate, middleware di autorizzazione)
- **Sessione:** JWT e/o cookie di sessione
- **Database:** MongoDB Atlas, collezioni Ordini e Ticket

---

## Architettura

### Frontend

SPA con client-side rendering in React.

**Responsabilità**

- interfaccia utente
- navigazione
- stato dell'applicazione (autenticazione e carrello)
- pagina dell'evento
- carrello e checkout
- visualizzazione dei ticket acquistati
- dashboard amministratore (biglietti venduti e acquirenti)
- pagina operatore per la scansione e la verifica del QR Code

**Tecnologie**

- React (`useState`, `useEffect`)
- React Router
- `useContext`
- Axios
- Tailwind CSS

### Backend

API REST esposte da Express.

**Responsabilità**

- registrazione e autenticazione
- gestione dell'evento unico
- gestione ordini
- report vendite e acquirenti per l'amministratore
- verifica dei QR Code per l'operatore
- generazione ticket e QR Code
- invio email di conferma acquisto

**Tecnologie**

- Node.js
- Express.js
- Passport.js
- hashing delle password
- JWT e/o cookie di sessione
- OAuth
- Swagger

---

## Database

### Utenti

- `_id`
- `nome`
- `cognome`
- `email` (univoca)
- `passwordHash` (facoltativo per gli account OAuth)
- `ruolo` (`amministratore` | `operatore` | `utente`)
- `dataCreazione`

### Eventi

Questa collezione contiene **un solo documento**: Calici e Colline.

- `_id`
- `titolo`
- `descrizione`
- `dataOra`
- `luogo`
- `prezzo` (in euro)
- `ticketDisponibili`

I posti disponibili sono letti direttamente da `ticketDisponibili` e diminuiscono quando viene confermato un ordine.

### Ordini

Un ordine rappresenta l'acquisto di uno o più biglietti da parte di un utente.

- `_id`
- `utenteId` (riferimento a `Utenti._id`)
- `quantita`
- `importoTotale` (in euro, al momento dell'acquisto)
- `dataAcquisto`

### Ticket

Viene creato **un documento per ciascun biglietto acquistato**.

- `_id`
- `ordineId` (riferimento a `Ordini._id`)
- `codice` (stringa casuale univoca usata per generare il QR Code)

Non si duplicano `utenteId` ed `eventoId`: l'acquirente si ricava dall'ordine e l'evento è sempre lo stesso. Non serve neanche uno `stato`: un ticket viene creato **solo dopo la conferma dell'ordine**, quindi è già venduto. L'immagine QR viene generata a partire da `codice`, senza salvarla nel database.

### Relazioni e regole essenziali

- **Utenti → Ordini:** un utente può effettuare più ordini (`utenteId`).
- **Ordini → Ticket:** un ordine può contenere più ticket (`ordineId`).
- **Evento:** è unico, quindi non occorrono riferimenti all'evento negli ordini o nei ticket.
- **Carrello:** resta nello stato di React; non serve una collezione dedicata.
- **Verifica QR:** l'operatore cerca un ticket tramite `codice`. Se esiste, il biglietto è valido; altrimenti non è trovato.
- **Statistiche:** il numero di biglietti venduti si ottiene contando i documenti `Ticket`; gli acquirenti si ricavano da `Ordini` e `Utenti`.
- **Vincoli:** `Utenti.email` e `Ticket.codice` devono avere un indice univoco.
- **Conferma ordine:** controllare e decrementare `ticketDisponibili`, creare l'ordine e i relativi ticket **nella stessa transazione MongoDB**, in modo da evitare vendite oltre i posti disponibili o dati incompleti.

---

## Sicurezza

- Salvare le password solo come hash, mai in chiaro.
- Autenticare le richieste e verificare i permessi sul backend in base al ruolo.
- Generare codici QR imprevedibili e univoci, non basati su numeri progressivi.
- Conservare chiavi di sessione in variabili d'ambiente.

---

## Stack tecnologico

### Frontend

- React
- React Router
- `useContext`
- Axios o Fetch
- Tailwind CSS

### Backend

- Node.js
- Express.js
- Passport.js
- JWT / cookie di sessione
- OAuth
- hashing delle password

### Database

- MongoDB Atlas

### Documentazione e deploy

- Swagger per le API
- deploy su **Vercel** (frontend e backend)

### Servizi esterni

- generatore QR Code
- SMTP per le email di conferma acquisto

