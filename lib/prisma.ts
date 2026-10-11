import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Opt-in slow-query logging: set DB_SLOW_QUERY_MS=500 to log any query slower than
// 500ms (duration + truncated SQL with `?` placeholders — never parameter values).
// Left unset there is no listener and no overhead.
const slowMs = Number.parseInt(process.env.DB_SLOW_QUERY_MS ?? '', 10)
const trackSlow = Number.isFinite(slowMs) && slowMs > 0

function createClient(): PrismaClient {
  const base = process.env.NODE_ENV === 'development' ? (['error', 'warn'] as const) : (['error'] as const)
  if (!trackSlow) return new PrismaClient({ log: [...base] })

  const client = new PrismaClient({
    log: [{ emit: 'event', level: 'query' }, ...base.map((level) => ({ emit: 'stdout' as const, level }))],
  })
  ;(client as unknown as { $on: (e: 'query', cb: (q: { duration: number; query: string }) => void) => void }).$on('query', (q) => {
    if (q.duration >= slowMs) console.warn('[db-slow]', JSON.stringify({ durationMs: q.duration, sql: q.query.slice(0, 200) }))
  })
  return client
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
