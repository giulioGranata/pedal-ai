import { NextResponse } from 'next/server';
import { getAthleteData } from '@/lib/data';

// API route GET /api/data
// Astrae la logica per il client se dovesse servire (es. route handler o chat)

export async function GET() {
  try {
    const data = await getAthleteData();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto';
    console.error('[api/data] Errore:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
