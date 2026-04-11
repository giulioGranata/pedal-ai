# PROMPT.md — Istruzioni per Claude Code

Leggi prima `PLAN.md` nella sua interezza prima di scrivere qualsiasi codice.

---

## Contesto

Stai buildando **pedal-ai**, una web app personale per un ciclista amatoriale avanzato (Giulio Granata). L'app legge dati di allenamento da Intervals.icu (sincronizzati giornalmente in `data/latest.json`) e li presenta in una dashboard con una chat AI integrata.

Tutti i dettagli architetturali, le scelte tecniche, il routing e la struttura cartelle sono definiti in `PLAN.md`. Non deviare da quel piano senza motivo esplicito.

---

## Regole generali

- **TypeScript strict** — nessun `any`, tipi espliciti ovunque
- **App Router** — usa sempre Next.js 14 App Router, mai Pages Router
- **Server Components di default** — usa `'use client'` solo dove strettamente necessario (interazioni, stato, browser APIs)
- **Tailwind** — nessun CSS custom file, tutto Tailwind utility classes
- **Nessun DB** — i dati vengono solo da `latest.json` via `/api/data`
- **Commenti in italiano** — commenta il codice in italiano
- **Nessuna dipendenza inutile** — aggiungi librerie solo se strettamente necessarie

---

## Fase 1 — Scaffold iniziale

Esegui questi comandi nell'ordine:

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

Poi installa le dipendenze necessarie:

```bash
npm install next-themes recharts @anthropic-ai/sdk
npm install -D @types/node
```

Crea la struttura cartelle esatta descritta in `PLAN.md`.

---

## Fase 2 — Dati mock

Prima di collegare i dati reali, crea `data/latest.json` con dati mock realistici seguendo esattamente la struttura definita in `PLAN.md` nella sezione "Struttura attesa".

I dati mock devono includere:
- Storico CTL/ATL/TSB degli ultimi 60 giorni (array di oggetti `{date, value}`)
- Wellness degli ultimi 14 giorni
- Almeno 10 attività recenti

---

## Fase 3 — Layout base

Costruisci prima il layout shell completo prima di qualsiasi contenuto:

### Sidebar (`components/layout/Sidebar.tsx`)
- Larghezza 220px espansa, 60px collassata
- Toggle button con icona hamburger/freccia
- Stato collasso in localStorage (key: `sidebar-collapsed`)
- Voci: Dashboard (`/`), Chat AI (`/chat`), divider, Settings (`/settings`)
- Voce attiva evidenziata con `bg-gray-100 dark:bg-gray-800`
- Icone SVG inline (nessuna libreria icone)
- Smooth transition CSS su width

### Topbar (`components/layout/Topbar.tsx`)
- Logo con nome "PedalAI"
- Avatar con iniziali "GG"
- Altezza 52px, border-bottom

### BottomNav (`components/layout/BottomNav.tsx`)
- Visibile solo su mobile (`md:hidden`)
- 3 voci: Dashboard, Chat, Settings
- `position: fixed; bottom: 0`

### Layout root (`app/layout.tsx`)
- Grid: sidebar + main content su desktop
- ThemeProvider da `next-themes` wrappa tutto
- `suppressHydrationWarning` su `<html>`

---

## Fase 4 — API route dati

Crea `app/api/data/route.ts`:

```typescript
// In sviluppo: legge data/latest.json dal filesystem
// In produzione: fetch da GITHUB_RAW_DATA_URL env var
// Restituisce sempre lo stesso formato JSON
// Cache: revalidate ogni ora
```

---

## Fase 5 — Dashboard home (`app/page.tsx`)

Costruisci nell'ordine:

1. **StatusBar** — banner verde in cima con suggerimento del giorno (testo statico per ora, poi collegato all'AI)
2. **MetricCard** — 4 card in grid (CTL, ATL, TSB, HRV), cliccabili, navigano alla sottorotta
3. **CTLATLChart** — grafico a barre doppie con recharts, ultimi 8 settimane
4. **TSBChart** — grafico a barre colorate (verde/arancio/rosso in base al valore)
5. **ActivityList** — lista ultime 5 attività con nome, durata, NP, TSS
6. **WellnessPanel** — HRV, resting HR, sonno con barre di progresso

Ogni componente è un Server Component che riceve i dati come props da `page.tsx`.

---

## Fase 6 — Sottopagine

### `/ctl-atl/page.tsx`
- Grafico storico espanso CTL/ATL/TSB a 90 giorni
- Spiegazione testuale delle metriche
- Tabella ultime 4 settimane con valori puntuali

### `/hrv/page.tsx`
- Grafico HRV trend ultimi 30 giorni
- Grafico resting HR trend
- Grafico ore sonno
- Interpretazione stato forma attuale

---

## Fase 7 — Script sync

Crea `scripts/sync.py`:

```python
# Fetch da Intervals.icu API
# Autenticazione: Basic Auth (username="API_KEY", password=INTERVALS_API_KEY)
# Athlete ID da env var INTERVALS_ATHLETE_ID
# Endpoints: /api/v1/athlete/{id}/wellness, /activities, /fitness
# Output: data/latest.json con struttura definita in PLAN.md
# Gestione errori: se un endpoint fallisce, mantieni i dati precedenti per quella sezione
```

Crea `.github/workflows/sync.yml` esattamente come definito in `PLAN.md`.

---

## Fase 8 — Chat AI

### API route (`app/api/chat/route.ts`)

```typescript
// POST body: { messages: Message[], data: AthleteData }
// Costruisce system prompt con i dati atleta serializzati
// Chiama Claude API (claude-sonnet-4-20250514) con streaming
// Restituisce stream di testo
```

### System prompt

```
Sei il coach AI personale di Giulio Granata, ciclista amatoriale avanzato con background da kickboxer.
Conosci i suoi dati di allenamento aggiornati a oggi.

DATI ATLETA:
{DATA_JSON}

Regole:
- Rispondi sempre in italiano
- Sii diretto e conciso, come un coach reale
- Quando menzioni zone di potenza usa Z1/Z2/Z3/Z4/Z5/Z6
- Se ti chiedono un grafico, rispondi con un JSON strutturato così:
  {"type":"chart","chartType":"line|bar","title":"...","data":[...],"xKey":"...","yKeys":["..."]}
  seguito da una spiegazione testuale
- Non inventare dati che non hai
- CTL alta = buona fitness, ATL alta = fatica accumulata, TSB negativo = in accumulo di carico
```

### ChatPanel (`components/chat/ChatPanel.tsx`)
- Client component con useState per messaggi e input
- Streaming della risposta (reader su fetch response body)
- Parsing JSON inline per grafici — se il messaggio contiene `{"type":"chart"...}` renderizza un `<RecChart />` inline
- Chip suggerimenti sotto il primo messaggio AI

---

## Fase 9 — Settings (`app/settings/page.tsx`)

- Toggle tema: Sistema / Chiaro / Scuro
- Usa `useTheme()` da `next-themes`
- Mostra data ultimo aggiornamento dati (da `latest.json.updated_at`)
- Pulsante "Aggiorna dati ora" (chiama workflow dispatch GitHub — opzionale fase 2)

---

## Fase 10 — Autenticazione

Crea `middleware.ts` nella root:

```typescript
// Controlla cookie 'pedal-auth'
// Se assente o invalido → redirect a /login
// Escludi da protezione: /login, /api/chat, /api/data, /_next
```

Crea `app/login/page.tsx`:
- Form con campo password
- POST a `/api/auth/route.ts`
- Se password corretta (confronto con `AUTH_PASSWORD` env var) → setta cookie httpOnly → redirect a `/`
- Design minimale, stesso stile app

---

## Variabili d'ambiente

Crea `.env.local.example` con:

```bash
INTERVALS_API_KEY=your_intervals_api_key
INTERVALS_ATHLETE_ID=i153108
ANTHROPIC_API_KEY=your_anthropic_api_key
AUTH_PASSWORD=your_app_password
GITHUB_RAW_DATA_URL=https://raw.githubusercontent.com/giulioGranata/pedal-ai/main/data/latest.json
```

---

## Colori e design

Segui il mockup approvato:
- **Accent color**: `#1D9E75` (teal ciclismo)
- **Font**: system font stack (no Google Fonts)
- **Border**: `border-gray-200 dark:border-gray-800`, sempre 1px
- **Card**: `bg-white dark:bg-gray-900 rounded-xl border`
- **Metric value**: `text-2xl font-medium`
- **Delta positivo**: `text-emerald-600`
- **Delta negativo**: `text-red-500`
- **Delta neutro**: `text-gray-500`

---

## Checklist prima del deploy

- [ ] Tutte le env vars configurate su Vercel
- [ ] Secrets GitHub Actions configurati (`INTERVALS_API_KEY`, `INTERVALS_ATHLETE_ID`)
- [ ] `data/latest.json` presente nel repo (anche con dati mock iniziali)
- [ ] Workflow sync testato manualmente (`workflow_dispatch`)
- [ ] Auth password funzionante
- [ ] Dark mode testata
- [ ] Mobile layout testato
