import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { processJobs } from '@/lib/jobs/queue'
import { registerAllJobHandlers } from '@/lib/jobs/handlers'

export const maxDuration = 60

function secretOk(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret || secret.length < 16) return false // disabled unless a strong secret is configured
  const given = req.headers.get('x-cron-secret') ?? ''
  const a = Buffer.from(given), b = Buffer.from(secret)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

// Call this from a Hostinger cron job every minute:
//   curl -fsS -X POST https://YOUR-DOMAIN/api/jobs/run -H "x-cron-secret: $CRON_SECRET"
export async function POST(req: Request) {
  if (!secretOk(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  registerAllJobHandlers()
  const summary = await processJobs({ maxJobs: 5, budgetMs: 45_000 })
  return NextResponse.json({ data: summary })
}
