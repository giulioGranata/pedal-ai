import { NextResponse } from 'next/server';

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

    // Risposta con Set-Cookie Header
    const response = NextResponse.json({ success: true }, { status: 200 });
    
    response.cookies.set({
      name: 'pedal-auth',
      value: 'authenticated_user',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 giorni
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
