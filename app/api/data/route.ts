import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { AthleteData } from '@/lib/types';

// API route GET /api/data
// - In sviluppo: legge data/latest.json dal filesystem locale
// - In produzione (Vercel): effettua fetch al raw GitHub URL via env var GITHUB_RAW_DATA_URL
// - Cache: revalidate ogni ora (3600 secondi)

export const revalidate = 3600;

export async function GET(): Promise<NextResponse<AthleteData | { error: string }>> {
  try {
    let data: AthleteData;

    if (process.env.NODE_ENV === 'development') {
      // Sviluppo locale: legge il file direttamente dal filesystem
      const filePath = join(process.cwd(), 'data', 'latest.json');
      const raw = readFileSync(filePath, 'utf-8');
      data = JSON.parse(raw) as AthleteData;
    } else {
      // Produzione: fetch dal raw GitHub URL configurato in env var
      const rawUrl = process.env.GITHUB_RAW_DATA_URL;
      if (!rawUrl) {
        throw new Error('GITHUB_RAW_DATA_URL non configurata');
      }
      const response = await fetch(rawUrl, {
        next: { revalidate: 3600 },
      });
      if (!response.ok) {
        throw new Error(`Fetch dati fallita: ${response.status}`);
      }
      data = (await response.json()) as AthleteData;
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto';
    console.error('[api/data] Errore:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
