import { readFileSync } from 'fs';
import { join } from 'path';
import type { AthleteData } from '@/lib/types';

// Helper univoco usato sia dalla API route che dai Server Components.
// Questo evita di fare HTTP fetch() dal server verso se stesso (anti-pattern in Next.js Server Components).
export async function getAthleteData(): Promise<AthleteData> {
  const isDev = process.env.NODE_ENV === 'development';
  const rawUrl = process.env.GITHUB_RAW_DATA_URL;

  // In sviluppo locale o se l'env var non è presente (es: Vercel build time), leggi il file locale
  if (isDev || !rawUrl) {
    const filePath = join(process.cwd(), 'data', 'latest.json');
    const raw = readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as AthleteData;
  }

  // In produzione runtime: fetch() dall'URL remoto di github raw e revalidate ogni ora 
  const res = await fetch(rawUrl, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`Impossibile caricare i dati atleta: ${res.status}`);
  }

  return res.json() as Promise<AthleteData>;
}
