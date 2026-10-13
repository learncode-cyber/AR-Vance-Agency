import { getRedis } from './redis';

// Fixed-window rate limiter.
//  - Uses external Redis when REDIS_URL is set (shared across instances).
//  - Falls back to a bounded in-memory store if Redis is missing or down,
//    so a Redis outage never takes the site down (fail-open to local limits).
type Entry = { count: number; resetTime: number }

const MAX_ENTRIES = 10_000
const rateLimitStore = new Map<string, Entry>()
let lastSweep = 0

function sweep(now: number) {
  // Expired entries were never removed before -> unbounded memory growth.
  if (now - lastSweep < 60_000 && rateLimitStore.size < MAX_ENTRIES) return
  lastSweep = now
  for (const [k, v] of rateLimitStore) {
    if (now > v.resetTime) rateLimitStore.delete(k)
  }
  if (rateLimitStore.size >= MAX_ENTRIES) {
    const first = rateLimitStore.keys().next().value
    if (first !== undefined) rateLimitStore.delete(first)
  }
}

function memoryLimit(rateKey: string, limit: number, windowSeconds: number): { success: boolean } {
  const now = Date.now()
  sweep(now)
  const entry = rateLimitStore.get(rateKey)
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(rateKey, { count: 1, resetTime: now + windowSeconds * 1000 })
    return { success: true }
  }
  if (entry.count >= limit) return { success: false }
  entry.count++
  return { success: true }
}

export async function rateLimit(
  key: string,
  action: string,
  limit: number,
  windowSeconds: number
): Promise<{ success: boolean }> {
  const rateKey = `rl:${action}:${key}`

  if (process.env.REDIS_URL) {
    try {
      const redis = await getRedis()
      if (redis) {
        const count = await redis.incr(rateKey)
        if (count === 1) await redis.expire(rateKey, windowSeconds)
        return { success: count <= limit }
      }
    } catch (err) {
      console.error('[rate-limit] Redis unavailable, using in-memory fallback:', (err as Error).message)
    }
  }
  return memoryLimit(rateKey, limit, windowSeconds)
}
