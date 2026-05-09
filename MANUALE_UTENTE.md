# Manuale Utente — Ink Society (labtattoo)

**Versione:** 1.0  
**Data:** Maggio 2026  
**Tecnologie:** React + TypeScript + Vite + Supabase + DuckDB + Docker + Nginx

---

## Indice

1. [Panoramica del Progetto](#1-panoramica-del-progetto)
2. [Architettura Tecnica](#2-architettura-tecnica)
3. [Pagine e Funzionalita](#3-pagine-e-funzionalita)
   - 3.1 [Home Page](#31-home-page)
   - 3.2 [Prenotazione Online](#32-prenotazione-online)
   - 3.3 [Area Amministratore](#33-area-amministratore)
4. [Database e Dati](#4-database-e-dati)
5. [Autenticazione Admin](#5-autenticazione-admin)
6. [Deploy su Raspberry Pi](#6-deploy-su-raspberry-pi)
7. [Problemi Noti e Soluzioni](#7-problemi-noti-e-soluzioni)
   - 7.1 [File non sincronizzati da Bolt su GitHub](#71-file-non-sincronizzati-da-bolt-su-github)
8. [Variabili d'Ambiente](#8-variabili-dambiente)
9. [Struttura File del Progetto](#9-struttura-file-del-progetto)

---

## 1. Panoramica del Progetto

**Ink Society** e' una web application per la gestione delle prenotazioni di uno studio di tatuaggi. Permette ai clienti di prenotare autonomamente una sessione online, e allo staff di gestire tutti gli appuntamenti attraverso un pannello amministrativo protetto da login.

**Obiettivi principali:**

- Permettere ai clienti di scegliere data e orario disponibile in autonomia
- Salvare le prenotazioni su database in cloud (Supabase)
- Permettere all'amministratore di visualizzare, confermare, annullare e contattare i clienti
- Essere deployabile su un Raspberry Pi tramite Docker

---

## 2. Architettura Tecnica

```
Frontend (React + Vite)
        |
        +-- Supabase (PostgreSQL in cloud)   <-- dati persistenti
        |
        +-- DuckDB WASM (in-browser)         <-- cache locale per letture veloci
```

- **Frontend:** React 18 con TypeScript, stilizzato con Tailwind CSS
- **Build tool:** Vite 5
- **Database cloud:** Supabase (PostgreSQL) — tabella `bookings`
- **Database locale browser:** DuckDB WASM — sincronizzato da Supabase, usato per letture rapide
- **Icone:** Lucide React
- **Deploy:** Docker + Nginx su Raspberry Pi, porta `6060`

---

## 3. Pagine e Funzionalita

### 3.1 Home Page

La pagina principale del sito. Accessibile da qualsiasi dispositivo.

**Contenuti:**

| Sezione | Descrizione |
|---|---|
| Hero | Immagine di sfondo, titolo animato, due CTA: "Prenota la Tua Sessione" e "Scopri i Nostri Lavori" |
| Specialita | 6 card con le tipologie di tatuaggio offerte (Blackwork, Tradizionale, Acquerello, Neo-Tradizionale, Fine Line, Design Personalizzato) |
| Galleria | 6 foto a griglia con effetto hover zoom |
| CTA Prenotazione | Sezione finale con pulsante per andare alla pagina di prenotazione |
| Footer | Link alla home, prenotazione, e link all'area admin |

**Animazioni:**
- Testo hero con fade-in e slide-up al caricamento
- Sezioni rivelate allo scroll con `IntersectionObserver`
- Hover su card e galleria

---

### 3.2 Prenotazione Online

Percorso guidato a 3 step + schermata di conferma finale. Il cliente non deve essere registrato.

#### Step 1 — Data e Orario

- **Calendario mensile** navigabile (mese precedente / successivo)
- I giorni passati sono disabilitati automaticamente
- La **domenica e' sempre disabilitata** (studio chiuso)
- I giorni con tutti gli slot occupati appaiono disabilitati
- Cliccando un giorno disponibile appaiono le **fasce orarie:**
  `10:00 | 11:00 | 12:00 | 14:00 | 15:00 | 16:00 | 17:00 | 18:00`
- Gli orari gia' prenotati appaiono barrati e non selezionabili
- Si puo' procedere solo dopo aver selezionato sia data che orario

#### Step 2 — Dati Personali

Campi del modulo:

| Campo | Obbligatorio | Validazione |
|---|---|---|
| Nome | Si | Minimo 2 caratteri |
| Cognome | Si | Minimo 2 caratteri |
| Telefono | Si | Formato valido (es. +39 333 1234567) |
| Email | No | Formato valido se inserita |
| Descrizione tatuaggio | Si | Minimo 10 caratteri |

Gli errori di validazione appaiono in rosso sotto ogni campo.

#### Step 3 — Revisione e Conferma

Riepilogo di tutti i dati inseriti prima dell'invio definitivo. Il cliente puo' tornare indietro per correggere.

#### Schermata Successo (Step 4)

Dopo la conferma viene mostrato:
- Messaggio di successo con la data e l'orario scelti
- **Codice di riferimento** (prime 8 cifre dell'ID prenotazione)
- Pulsanti "Torna alla Home" e "Nuova Prenotazione"

---

### 3.3 Area Amministratore

Accessibile dal footer del sito oppure navigando direttamente alla rotta admin. Protetta da autenticazione email + password.

#### Login Admin

- Form con email e password
- Pulsante mostra/nascondi password
- Gestione errori (credenziali errate, account non esistente)
- Possibilita' di creare un nuovo account admin (prima configurazione)
- Link per tornare al sito pubblico

#### Dashboard Appuntamenti

**Statistiche in cima alla pagina:**

| Card | Descrizione |
|---|---|
| Totale | Numero totale prenotazioni nel database |
| Oggi | Prenotazioni con data odierna |
| In Attesa | Prenotazioni non ancora gestite |
| Confermati | Prenotazioni confermate |
| Annullati | Prenotazioni annullate |

**Filtri disponibili:**
- Ricerca testuale per nome o numero di telefono
- Filtro per stato: Tutti / In Attesa / Confermato / Annullato
- Filtro per data specifica
- Pulsante "Azzera" per resettare tutti i filtri

**Tabella prenotazioni (desktop):**

Colonne: Data | Orario | Cliente | Telefono | Descrizione | Stato | Azioni

**Card prenotazioni (mobile):**
Layout compatto adattato agli schermi piccoli con le stesse informazioni.

**Azioni per ogni prenotazione:**

| Azione | Descrizione |
|---|---|
| Conferma (spunta verde) | Cambia lo stato a "Confermato" |
| Annulla (croce rossa) | Cambia lo stato a "Annullato" |
| WhatsApp | Apre WhatsApp con messaggio precompilato al cliente |
| Email | Apre il client email con messaggio precompilato |
| Chiama | Apre la composizione telefonica direttamente |

**Badge di stato:**
- Giallo: In Attesa
- Verde: Confermato
- Grigio: Annullato

**Sincronizzazione DB:**
Il pulsante "Sincronizza dal DB" in alto a destra forza un refresh dei dati da Supabase nella cache locale DuckDB.

---

## 4. Database e Dati

Il database e' ospitato su **Supabase** (PostgreSQL). La tabella principale e' `bookings`.

### Struttura tabella `bookings`

| Colonna | Tipo | Descrizione |
|---|---|---|
| id | uuid | Chiave primaria generata automaticamente |
| name | text | Nome del cliente |
| surname | text | Cognome del cliente |
| phone | text | Numero di telefono |
| email | text | Email (opzionale) |
| description | text | Descrizione del tatuaggio richiesto |
| booking_date | date | Data dell'appuntamento |
| booking_time | text | Orario dell'appuntamento (es. "14:00") |
| status | text | Stato: `pending`, `confirmed`, `cancelled` |
| created_at | timestamptz | Data e ora di creazione |

### Sicurezza (Row Level Security)

- RLS abilitato sulla tabella `bookings`
- **Chiunque** (anche non autenticato) puo' **inserire** nuove prenotazioni
- Solo gli **utenti autenticati** possono **leggere** e **aggiornare** i record

### Doppio livello di storage

1. **Supabase** — fonte di verita', dati persistenti in cloud
2. **DuckDB WASM** — database in-memory nel browser, sincronizzato da Supabase all'avvio, usato per query veloci lato client

---

## 5. Autenticazione Admin

L'autenticazione usa **Supabase Auth** con email e password.

**Flusso:**
1. Admin va su `/admin` (o clicca il link nel footer)
2. Inserisce email e password
3. Supabase verifica le credenziali
4. In caso di successo, viene reindirizzato alla dashboard
5. La sessione viene mantenuta finche' non si clicca "Logout"

**Prima configurazione:**
Alla prima installazione, cliccare "Crea account amministratore" nella pagina di login per registrare le credenziali admin. Successivamente questa funzione puo' essere rimossa o limitata.

**Sicurezza:**
- Se si tenta di accedere alla dashboard senza essere autenticati, si viene automaticamente reindirizzati al login
- Il logout cancella la sessione Supabase e riporta alla home

---

## 6. Deploy su Raspberry Pi

### Prerequisiti

- Raspberry Pi con Raspberry Pi OS (o compatibile)
- Docker e Docker Compose installati
- Accesso SSH o terminale locale
- Repository GitHub clonata

### Struttura file di deploy

```
Dockerfile          -- Immagine Docker: Nginx + build del sito
docker-compose.yml  -- Configurazione servizio (porta 6060)
nginx.conf          -- Configurazione Nginx (SPA, gzip, cache asset)
```

### Comandi di deploy

```bash
# 1. Clona la repository
git clone https://github.com/fgoose68/labtattoo2.git
cd labtattoo2

# 2. Avvia il container (build automatica inclusa)
docker compose up -d --build

# 3. Verifica che il container sia attivo
docker ps

# 4. Per aggiornare dopo una modifica al codice
git pull
docker compose up -d --build
```

### Accesso al sito

Dopo il deploy, il sito e' accessibile su:

```
http://<indirizzo-ip-raspberry>:6060
```

### Configurazione Nginx

- Serve i file statici della build (`dist/`)
- Gestisce il routing SPA: tutte le URL non corrispondenti a file vengono reindirizzate a `index.html`
- Compressione gzip abilitata per JS, CSS, SVG
- Cache 1 anno per asset statici (JS, CSS, immagini, font)

---

## 7. Problemi Noti e Soluzioni

### 7.1 File non sincronizzati da Bolt su GitHub

**Sintomo:**

Dopo aver lavorato in Bolt e sincronizzato con GitHub, alcuni file (`Dockerfile`, `docker-compose.yml`, `nginx.conf`) non compaiono nella repository.

**Causa:**

Bolt sincronizza su GitHub solo i file che appartengono al suo template interno. I file aggiunti manualmente durante la sessione di sviluppo (file Docker, configurazioni custom) vengono ignorati dal meccanismo di sync automatico.

**Soluzione 1 — Nuova repository (soluzione adottata):**

1. Creare una nuova repository su GitHub (es. `labtattoo2`)
2. In Bolt, aprire le impostazioni del progetto
3. Scollegare la vecchia repository e collegare la nuova
4. Avviare una nuova sincronizzazione
5. Bolt carichera' tutti i file presenti nel progetto, inclusi quelli aggiunti manualmente

**Soluzione 2 — Upload manuale su GitHub:**

1. In Bolt, cliccare **Export** -> **Download ZIP**
2. Estrarre il file ZIP sul proprio computer
3. Su GitHub, aprire la repository esistente
4. Cliccare **"Add file"** -> **"Upload files"**
5. Trascinare i file mancanti (`Dockerfile`, `docker-compose.yml`, `nginx.conf`)
6. Cliccare **"Commit changes"**

**Prevenzione:**

Per evitare che il problema si ripresenti, dopo ogni sessione in cui si aggiungono file nuovi non-standard, verificare che tutti i file siano presenti su GitHub prima di chiudere la sessione Bolt.

---

## 8. Variabili d'Ambiente

Il file `.env` nella root del progetto contiene le variabili necessarie per il collegamento a Supabase:

```
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<chiave-anonima-pubblica>
```

Queste variabili sono prefissate con `VITE_` per essere accessibili nel codice frontend compilato da Vite.

**Nota di sicurezza:** La chiave `ANON_KEY` e' pubblica per design (e' la chiave anonima di Supabase). La sicurezza dei dati e' garantita dalle policy RLS configurate nel database, non dalla segretezza della chiave.

---

## 9. Struttura File del Progetto

```
labtattoo2/
├── public/
├── src/
│   ├── components/
│   │   ├── Header.tsx          -- Header con navigazione
│   │   └── Footer.tsx          -- Footer con link e info
│   ├── pages/
│   │   ├── Home.tsx            -- Pagina principale
│   │   ├── Booking.tsx         -- Prenotazione (3 step)
│   │   ├── AdminLogin.tsx      -- Login amministratore
│   │   └── AdminDashboard.tsx  -- Dashboard gestione appuntamenti
│   ├── lib/
│   │   ├── supabase.ts         -- Client Supabase singleton
│   │   ├── duckdb.ts           -- Inizializzazione DuckDB WASM
│   │   ├── db.ts               -- Query DuckDB (letture, cache)
│   │   └── bookings.ts         -- Operazioni CRUD Supabase
│   ├── App.tsx                 -- Router principale + auth state
│   ├── main.tsx                -- Entry point
│   └── index.css               -- Stili globali Tailwind
├── supabase/
│   └── migrations/             -- Migrazioni SQL del database
├── Dockerfile                  -- Build immagine Docker
├── docker-compose.yml          -- Configurazione servizio Docker
├── nginx.conf                  -- Configurazione server Nginx
├── .env                        -- Variabili d'ambiente (non committare)
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── MANUALE_UTENTE.md           -- Questo file
```
