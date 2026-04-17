import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { ChatMessage, AthleteData } from '@/lib/types';
import { COOKIE_NAME, verifyAuthToken } from '@/lib/auth';
import { checkChatRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') ?? '';
    const rawToken = cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${COOKIE_NAME}=`))
      ?.split('=')[1];
    const token = rawToken ? decodeURIComponent(rawToken) : undefined;
    const isAuthenticated = await verifyAuthToken(token);
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await req.json();
    const messages: ChatMessage[] = body.messages;
    const data: AthleteData = body.data;

    if (!messages || !data) {
      return NextResponse.json({ error: 'Dati o messaggi mancanti' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
       return NextResponse.json({ error: 'API KEY Claude non configurata' }, { status: 500 });
    }

    const forwarded = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const ip = forwarded.split(',')[0]?.trim() || '127.0.0.1';
    const ratelimit = await checkChatRateLimit(`chat:${ip}`);
    if (!ratelimit.success) {
      return NextResponse.json({ error: 'Rate limit raggiunto. Riprova tra poco.' }, { status: 429 });
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
- Non inventare dati che non hai
- CTL alta = buona fitness, ATL alta = fatica accumulata, TSB negativo = in accumulo di carico`;

    // Stream della risposta tramite l'SDK ufficiale
    const stream = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: [{
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      }],
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
