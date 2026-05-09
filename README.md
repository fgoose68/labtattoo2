# labtattoo2
Sito per la gestione delle prenotazioni dello studio tattoo con accesso Admin per visualizzare gli appuntamenti.

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-uzbz2zq1)

---

## Problema: file non sincronizzati su GitHub da Bolt

### Sintomo
Alcuni file (`Dockerfile`, `docker-compose.yml`, `nginx.conf`) creati durante la sessione Bolt non compaiono nella repository GitHub dopo la sincronizzazione.

### Causa
Bolt sincronizza con GitHub solo i file che riconosce come parte del suo template iniziale. I file aggiunti manualmente durante la sessione (es. file Docker) vengono ignorati dal sync automatico.

### Soluzione adottata
1. Creare una **nuova repository** su GitHub (es. `labtattoo2`) invece di usare quella originale
2. In Bolt, andare nelle impostazioni del progetto e collegare la nuova repository
3. Forzare una nuova sincronizzazione — Bolt a quel punto carica tutti i file presenti nel progetto, inclusi quelli aggiunti manualmente

### Soluzione alternativa (se non si vuole creare una nuova repo)
1. In Bolt, cliccare **Export / Download ZIP** per scaricare tutti i file del progetto
2. Su GitHub, aprire la repository esistente
3. Cliccare **"Add file"** → **"Upload files"**
4. Trascinare i file mancanti (`Dockerfile`, `docker-compose.yml`, `nginx.conf`)
5. Cliccare **"Commit changes"**

---

## Deploy su Raspberry Pi

### Prerequisiti
- Docker e Docker Compose installati sul Raspberry
- Repository clonata localmente

### Comandi

```bash
# Clona la repo
git clone https://github.com/fgoose68/labtattoo2.git
cd labtattoo2

# Build e avvio del container
docker compose up -d --build

# Verifica che il container sia in esecuzione
docker ps
```

Il sito sara' disponibile su `http://<ip-raspberry>:6060`
