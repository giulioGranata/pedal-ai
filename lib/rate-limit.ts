import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(25, '1 h'),
    analytics: true,
  });

  return ratelimit;
}

export async function checkChatRateLimit(identifier: string) {
  const limiter = getRatelimit();
  if (!limiter) {
    return { success: true, limit: -1, remaining: -1, reset: 0 };
  }
  return limiter.limit(identifier);
}
