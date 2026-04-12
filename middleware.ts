import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protegge l'app tramite semplice verifica della presenza del cookie di autenticazione.
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Tutte le route pubbliche non soggette a protezione
  // NB: Le API backend (chat, data, ecc) possono essere esposte senza auth per il fetch github
  // o l'uso programmatico interno.
  const isPublicPath = path === '/login' || 
                       path.startsWith('/api/') || 
                       path.startsWith('/_next/') || 
                       path.includes('.svg') ||
                       path === '/favicon.ico';

  // Ottieni il cookie di autenticazione configurato nel login
  const token = request.cookies.get('pedal-auth')?.value;

  // Se l'utente non è autenticato e tenta di accedere a route protette, reindirizza al login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se è già loggato e va sul login, lo rigira alla dashboard
  if (path === '/login' && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Applica il middleware a praticamente l'intera app escludendo in blocco alcune directory base per performance
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
