import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

// The database connection is created on first use, not at import time. This lets `next build`
// collect page data on a machine that has no DATABASE_URL yet (the database is only needed when
// a request actually runs a query). A missing URL still fails loudly at runtime.
function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set. Add it to .env.local (or your host environment).')
  const u = new URL(url)
  const adapter = new PrismaMariaDb({
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.slice(1),
    connectionLimit: Number(process.env.DB_POOL_SIZE || 5),
  })
  return new PrismaClient({ adapter, log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] })
}

const globalForPrisma = global as unknown as { prisma?: PrismaClient }

function client(): PrismaClient {
  if (!globalForPrisma.prisma) globalForPrisma.prisma = createClient()
  return globalForPrisma.prisma
}

// Lazy proxy: `prisma.lead.findMany(...)` etc. work exactly as before, but nothing connects until used.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const c = client() as unknown as Record<string | symbol, unknown>
    const value = c[prop]
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(c) : value
  },
}) as PrismaClient
