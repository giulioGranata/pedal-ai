const COOKIE_NAME = 'pedal-auth';
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30;

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET non configurato');
  }
  return secret;
}

async function hmacSha256(input: string): Promise<string> {
  const secret = getAuthSecret();
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(input));
  const bytes = new Uint8Array(signature);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function createAuthToken(ttlSeconds = DEFAULT_TTL_SECONDS): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = String(expiresAt);
  const signature = await hmacSha256(payload);
  return `${payload}.${signature}`;
}

export async function verifyAuthToken(token?: string): Promise<boolean> {
  if (!token) return false;
  const [expiresAtRaw, signature] = token.split('.');
  if (!expiresAtRaw || !signature) return false;

  const expiresAt = Number.parseInt(expiresAtRaw, 10);
  if (!Number.isFinite(expiresAt)) return false;
  if (Math.floor(Date.now() / 1000) > expiresAt) return false;

  const expected = await hmacSha256(expiresAtRaw);
  return safeCompare(expected, signature);
}

export { COOKIE_NAME, DEFAULT_TTL_SECONDS };
