import { NextResponse } from 'next/server';
import { COOKIE_NAME, DEFAULT_TTL_SECONDS, createAuthToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;

    const envPassword = process.env.AUTH_PASSWORD;

    // Controllo
    if (envPassword && password !== envPassword) {
      return NextResponse.json({ error: 'Password errata' }, { status: 401 });
    }

    if (!envPassword) {
      console.warn("ATTENZIONE: AUTH_PASSWORD non è settata nel file .env.local, chiunque può accedere.");
    }

    const token = await createAuthToken(DEFAULT_TTL_SECONDS);

    // Risposta con Set-Cookie Header
    const response = NextResponse.json({ success: true }, { status: 200 });
    
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: DEFAULT_TTL_SECONDS,
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
