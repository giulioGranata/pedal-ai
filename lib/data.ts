import type { AthleteData } from '@/lib/types';

// Helper per chiamare GET /api/data dai Server Components
// Restituisce i dati dell'atleta o lancia un errore
export async function getAthleteData(): Promise<AthleteData> {
  // In Server Components possiamo usare URL assoluto via NEXT_PUBLIC o relativo
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  const response = await fetch(`${baseUrl}/api/data`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Impossibile caricare i dati atleta: ${response.status}`);
  }

  return response.json() as Promise<AthleteData>;
}
