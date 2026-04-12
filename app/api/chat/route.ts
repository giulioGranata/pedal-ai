import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { ChatMessage, AthleteData } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages;
    const data: AthleteData = body.data;

    if (!messages || !data) {
      return NextResponse.json({ error: 'Dati o messaggi mancanti' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
       return NextResponse.json({ error: 'API KEY Claude non configurata' }, { status: 500 });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const systemPrompt = `Sei il coach AI personale di Giulio Granata, ciclista amatoriale avanzato con background da kickboxer.
Conosci i suoi dati di allenamento aggiornati a oggi.

DATI ATLETA:
${JSON.stringify({
  updated_at: data.updated_at,
  fitness: data.fitness,
  wellness: data.wellness,
  recent_activities: data.activities.slice(0, 5) // Manda solo le ultime 5 per risparmiare token
})}

Regole:
- Rispondi sempre in italiano
- Sii diretto e conciso, come un coach reale
- Quando menzioni zone di potenza usa Z1/Z2/Z3/Z4/Z5/Z6
- Se ti chiedono un grafico, rispondi OVE POSSIBILE con un JSON strutturato così:
  {"type":"chart","chartType":"line|bar","title":"...","data":[...],"xKey":"...","yKeys":["..."]}
  seguito da una spiegazione testuale. Assicurati che il file JSON sia isolato e parta con '{'.
- Non inventare dati che non hai
- CTL alta = buona fitness, ATL alta = fatica accumulata, TSB negativo = in accumulo di carico`;

    // Stream della risposta tramite l'SDK ufficiale
    const stream = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514', // Versione richiesta dal prompt
      max_tokens: 1500,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto';
    console.error('[api/chat] Errore:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
