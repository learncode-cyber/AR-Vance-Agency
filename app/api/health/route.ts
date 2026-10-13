import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Public liveness/readiness probe for uptime monitors and the post-deploy check.
// Returns only ok/not-ok flags — never connection strings, versions or error text.
export async function GET() {
  let db = false
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000)),
    ])
    db = true
  } catch {
    db = false
  }
  return NextResponse.json({ status: db ? 'ok' : 'degraded', db, time: new Date().toISOString() }, { status: db ? 200 : 503, headers: { 'Cache-Control': 'no-store' } })
}
