# pedal-ai — Piano di progetto

## Cos'è

Web app personale per Giulio Granata. Dashboard ciclismo alimentata da dati Intervals.icu con chat AI integrata. Uso privato, nessun multi-tenancy.

---

## Stack

- **Framework**: Next.js Latest (App Router)
- **Linguaggio**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Dati**: JSON sincronizzato da Intervals.icu via GitHub Actions
- **Hosting**: Vercel (free tier)
- **Autenticazione**: middleware Next.js con password via env var

---

## Struttura cartelle

```
pedal-ai/
├── .github/
│   └── workflows/
│       └── sync.yml              # GitHub Actions — sync giornaliero 06:00 UTC
├── data/
│   └── latest.json               # Output sync — letto dalla webapp
├── scripts/
│   └── sync.py                   # Script Python — fetch da Intervals.icu API
├── src/
│   └── app/
│       ├── layout.tsx             # Layout root con sidebar + topbar
│       ├── page.tsx               # / → Dashboard home
│       ├── ctl-atl/
│       │   └── page.tsx           # /ctl-atl → Dettaglio CTL/ATL
│       ├── hrv/
│       │   └── page.tsx           # /hrv → Dettaglio HRV + wellness
│       ├── chat/
│       │   └── page.tsx           # /chat → Chat AI
│       ├── settings/
│       │   └── page.tsx           # /settings → Tema + configurazione
│       └── api/
│           ├── data/
│           │   └── route.ts       # GET /api/data → legge latest.json
│           └── chat/
│               └── route.ts       # POST /api/chat → proxy Claude API
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx        # Sidebar collassabile (desktop)
│   │   │   ├── Topbar.tsx         # Topbar con logo e avatar
│   │   │   └── BottomNav.tsx      # Bottom navigation (mobile)
│   │   ├── dashboard/
│   │   │   ├── MetricCard.tsx     # Card CTL/ATL/TSB/HRV cliccabile
│   │   │   ├── StatusBar.tsx      # Banner suggerimento AI in cima
│   │   │   ├── CTLATLChart.tsx    # Grafico CTL vs ATL
│   │   │   ├── TSBChart.tsx       # Grafico TSB
│   │   │   ├── ActivityList.tsx   # Lista attività recenti
│   │   │   └── WellnessPanel.tsx  # HRV, resting HR, sonno
│   │   └── chat/
│   │       ├── ChatPanel.tsx      # Container chat
│   │       ├── Message.tsx        # Singolo messaggio (testo o grafico)
│   │       └── ChatInput.tsx      # Input + invio
│   ├── lib/
│   │   ├── data.ts                # Helper fetch latest.json
│   │   ├── types.ts               # Tipi TypeScript per i dati
│   │   └── claude.ts              # Helper chiamate Claude API
│   └── middleware.ts              # Protezione password
├── .env.local.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── PLAN.md
└── PROMPT.md
```

---

## Routing

| Route       | Descrizione                                       |
| ----------- | ------------------------------------------------- |
| `/`         | Dashboard home — metriche + grafici + attività    |
| `/ctl-atl`  | Dettaglio CTL, ATL, TSB — grafico storico espanso |
| `/hrv`      | Dettaglio HRV, resting HR, wellness trend         |
| `/chat`     | Chat AI con contesto dati completo                |
| `/settings` | Tema (chiaro/scuro/sistema), configurazione       |

---

## Layout — ispirazione YouTube

### Desktop

```
┌─────────────────────────────────────────────────┐
│ TOPBAR (logo + avatar)                          │
├────────────┬────────────────────────────────────┤
│ SIDEBAR    │ MAIN CONTENT                       │
│ (220px)    │                                    │
│ Dashboard  │ (cambia in base alla rotta)        │
│ Chat AI    │                                    │
│ ──────     │                                    │
│ Settings   │                                    │
└────────────┴────────────────────────────────────┘
```

- Sidebar collassabile a icone sole (60px) con toggle button
- Stato collasso salvato in localStorage
- Transizione CSS smooth

### Mobile

```
┌─────────────────┐
│ TOPBAR          │
├─────────────────┤
│ MAIN CONTENT    │
│                 │
│                 │
├─────────────────┤
│ BOTTOM NAV      │
│ 🏠  💬  ⚙️     │
└─────────────────┘
```

- Sidebar nascosta su mobile
- Bottom navigation fissa con 3 voci: Dashboard, Chat, Settings

---

## Dati — latest.json

Il file `data/latest.json` viene aggiornato ogni giorno alle 06:00 UTC dallo script `scripts/sync.py` tramite GitHub Actions.

### Struttura attesa

```json
{
  "updated_at": "2026-04-11T06:00:00Z",
  "athlete": {
    "id": "i153108",
    "name": "Giulio Granata"
  },
  "fitness": {
    "ctl": 74,
    "atl": 81,
    "tsb": -7,
    "ctl_history": [...],
    "atl_history": [...],
    "tsb_history": [...]
  },
  "wellness": {
    "hrv": 58,
    "resting_hr": 48,
    "sleep_hours": 7.2,
    "energy": 3
  },
  "activities": [
    {
      "id": "...",
      "date": "2026-04-10",
      "name": "Uscita mattutina",
      "duration_seconds": 6120,
      "distance_meters": 68000,
      "normalized_power": 198,
      "intensity_factor": 0.74,
      "tss": 76,
      "type": "Ride"
    }
  ]
}
```

### Come viene letto

- In locale (dev): `fs.readFileSync('data/latest.json')`
- In produzione (Vercel): fetch al raw GitHub URL del file nel repo
- API route `GET /api/data` astrae questa logica — i componenti chiamano sempre `/api/data`

---

## Script sync — scripts/sync.py

Fetch da Intervals.icu API con autenticazione Basic Auth (API key come password, username `API_KEY`).

### Endpoints usati

- `GET /api/v1/athlete/{id}` — profilo atleta
- `GET /api/v1/athlete/{id}/wellness` — HRV, resting HR, sonno (ultimi 30 giorni)
- `GET /api/v1/athlete/{id}/activities` — lista attività (ultimi 30 giorni)
- `GET /api/v1/athlete/{id}/fitness` — CTL/ATL/TSB storici

### Secrets GitHub Actions richiesti

- `INTERVALS_API_KEY` — API key Intervals.icu
- `INTERVALS_ATHLETE_ID` — athlete ID (es. `i153108`)

---

## GitHub Actions — .github/workflows/sync.yml

```yaml
name: Sync Intervals.icu data

on:
  schedule:
    - cron: "0 6 * * *"
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install requests
      - run: python scripts/sync.py
        env:
          INTERVALS_API_KEY: ${{ secrets.INTERVALS_API_KEY }}
          INTERVALS_ATHLETE_ID: ${{ secrets.INTERVALS_ATHLETE_ID }}
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: sync intervals.icu data"
          file_pattern: data/latest.json
```

---

## Chat AI — /api/chat

### Comportamento

- Ogni richiesta alla chat include nel system prompt i dati completi di `latest.json`
- Claude ha contesto completo: fitness, wellness, attività recenti
- La chat può rispondere in testo, generare grafici (come componenti React volatili inline), pianificare allenamenti
- I messaggi vivono solo nel client (no persistenza DB) — il contesto viene ricostruito ad ogni sessione

### System prompt base

```
Sei il coach AI personale di Giulio Granata, ciclista amatoriale avanzato.
Hai accesso ai suoi dati di allenamento aggiornati:

[DATI_ATLETA_JSON]

Rispondi in italiano. Quando generi grafici, restituisci JSON strutturato
con tipo "chart" e i dati necessari. Quando pianifichi allenamenti,
usa le zone di potenza standard (Z1-Z6).
```

---

## Autenticazione

Semplice middleware Next.js con password in env var. Nessun auth provider, nessun DB.

```typescript
// src/middleware.ts
// Se cookie 'auth' non presente o non valido → redirect a /login
// /login accetta POST con password → setta cookie → redirect a /
```

Env var: `AUTH_PASSWORD`

---

## Tema

- Default: `prefers-color-scheme` del sistema operativo
- Override: salvato in localStorage via `next-themes`
- Opzioni: chiaro / scuro / sistema
- Configurabile da `/settings`

---

## Env vars

```bash
# .env.local
INTERVALS_API_KEY=...          # API key Intervals.icu
INTERVALS_ATHLETE_ID=i153108   # Athlete ID
ANTHROPIC_API_KEY=...          # Claude API key
AUTH_PASSWORD=...              # Password accesso app
GITHUB_RAW_DATA_URL=https://raw.githubusercontent.com/giulioGranata/pedal-ai/main/data/latest.json
```

---

## Ordine di sviluppo consigliato

1. **Scaffold** — `create-next-app`, Tailwind, struttura cartelle
2. **Layout** — Sidebar, Topbar, BottomNav, routing base
3. **API data route** — `/api/data` che legge `latest.json` (con dati mock iniziali)
4. **Dashboard home** — MetricCard, StatusBar, grafici con dati mock
5. **Sottopagine** — `/ctl-atl`, `/hrv`
6. **Script sync** — `sync.py` + GitHub Actions workflow
7. **Chat** — `/api/chat` + ChatPanel con contesto dati
8. **Settings** — tema toggle
9. **Auth** — middleware password
10. **Deploy** — Vercel, env vars, test sync in produzione

---

## Note tecniche

- Usare `recharts` o `Chart.js` per i grafici — già familiare, zero configurazione extra
- Nessun database — tutto stateless o localStorage
- Nessun auth provider esterno — solo cookie + env var
- Il file `data/latest.json` viene committato nel repo dal workflow — Vercel lo serve staticamente
- In sviluppo locale, `sync.py` può essere eseguito manualmente per aggiornare i dati
