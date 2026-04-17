# PedalAI — Piano di refactoring e chiusura MVP

> Review di Opus 4.7 — 2026-04-17

---

## 🔴 Blocker (prima di tutto il resto)

1. **`/api/chat` è esposto pubblicamente**
   - Il middleware esclude `/api/*` → chiunque conosce l'URL Vercel brucia la tua API key Claude
   - Fix: autenticare `/api/chat` nel middleware; escludere solo `/api/auth`

2. **Cookie auth statico e non firmato**
   - Valore hardcoded `'authenticated_user'` — chiunque con devtools può forgiarlo
   - Fix: firma con HMAC+secret, oppure `iron-session`, o almeno valore random rotazionale

3. **Modello Claude vecchio**
   - `claude-sonnet-4-20250514` è superato da Sonnet 4.6 (`claude-sonnet-4-6`)
   - Fix: aggiornare `app/api/chat/route.ts:46`

4. **Nessun rate limit su `/api/chat`**
   - Anche con auth, un cookie leakato = conto Anthropic svuotato
   - Fix: Upstash ratelimit (free tier) o Map in-memory per uso personale

---

## 🟡 Refactoring tecnico

5. **Type safety chat**: eliminare i due `@ts-ignore` in `ChatPanel.tsx` — tipare `RecChart` con discriminated union `{chartType:'line'} | {chartType:'bar'}`

6. **Parsing chart nel testo**: `parseChartFromText` è un brace-matcher manuale fragile
   - Alternativa pulita: **tool use** di Claude con tool `render_chart`
   - Elimini il parser, Claude emette JSON strutturato garantito

7. **Error/loading boundaries**: aggiungere `error.tsx` e `loading.tsx` in `app/(app)/`
   - Oggi se `latest.json` fallisce l'utente vede schermata bianca

8. **Revalidate duplicato**: `revalidate = 3600` dichiarato sia in `lib/data.ts` che in `app/api/data/route.ts` — tenere solo uno

9. **Date handling**: `new Date("2026-04-09")` con timezone locale può sbagliare giorno
   - Centralizzare parsing/formattazione in `lib/date.ts`

10. **Magic numbers**: soglie TSB in `StatusBar.tsx`, range HRV 30-100 in `WellnessPanel.tsx`
    - Estrarre in `lib/thresholds.ts`

11. **Memoization grafici**: `mergeHistories` ricomputa a ogni render → `useMemo`

12. **DX**: aggiungere `.env.example`, Prettier, `lint-staged` pre-commit

---

## 🟢 Polishing UX

13. Skeleton loaders per dashboard/chat

14. ChatPanel: stop generation, copy response, messaggio "sto pensando…" durante latency iniziale streaming

15. Empty state se `activities` è vuoto (succede nei recovery week)

16. **Prompt caching**: usa `cache_control: ephemeral` sul blocco dati in ogni messaggio — riduce costo Anthropic ~90% nelle conversazioni lunghe

---

## ➕ Cosa aggiungere (post-MVP, in ordine di valore)

| Feature | Valore | Sforzo |
|---------|--------|--------|
| Activity detail `/activities/[id]` — breakdown, note | Alto | Basso |
| Workout planner AI con tool use → card strutturate | Alto | Medio |
| Power curve / PR tracking (endpoint Intervals `/power-curves`) | Alto | Basso |
| Compare periods: ultimi 28gg vs 28gg precedenti | Medio | Medio |
| Weekly digest via email (GitHub Action + Claude + Resend) | Alto | Basso |
| Strava webhook sync invece del cron 3×/giorno | Medio | Medio |
| Export PDF del periodo da condividere con coach | Basso | Medio |
| Voice input mobile (Web Speech API) | Basso | Basso |

---

## ➖ Cosa tagliare / rimandare

| Cosa | Perché |
|------|--------|
| **`/settings` come route** | Unica funzione: theme toggle + `updated_at`. Sposta toggle in Topbar, `updated_at` in footer. |
| **Light theme** | Dashboard sportiva → solo dark. Elimina `next-themes` e `ThemeProvider`, zero hydration complexity. |
| **`/ctl-atl` e `/hrv` come route** | Grafici espansi → modal/drawer da MetricCard. Meno routing, meno fetch duplicati. |
| **Tabella 28 giorni in `/ctl-atl`** | Il grafico basta, la tabella è rumore. |
| **Sidebar collapsible + localStorage** | Per una persona sola: Sidebar sempre aperta su desktop. Elimina la logica collapse. |
| **Form password custom** | Per uso personale: Vercel Password Protection batte il form con plaintext compare. |
| **Suggested prompts hardcoded** | 3 bottoni che invecchiano male. Rimuovere o renderli dinamici basati su TSB corrente. |
| **Chart-in-chat (parseChartFromText)** | Complicato, fragile, basso ROI. Rimandare dopo tool use. |

---

## Ordine esecutivo

```
Settimana 1 — Chiusura sicurezza (punti 1–4)
Settimana 2 — Sfoltimento (sezione "cosa tagliare")
Settimana 3 — Polish tecnico e UX (punti 5–16)
Post-MVP   — Feature lista "aggiungere", priorità: Activity detail + Compare periods
```
