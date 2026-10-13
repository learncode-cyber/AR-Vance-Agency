import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { parseCspReports } from '@/lib/csp-report'

const MAX_BYTES = 10_000

// Browsers POST CSP violations here (see `report-uri` in next.config.ts).
// Public by necessity, so it is size-capped, rate-limited, stores nothing and
// only writes a bounded log line. Always 204 so it can't be used as an oracle.
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'csp-report', 30, 60)).success) return new NextResponse(null, { status: 204 })

  const text = await req.text().catch(() => '')
  if (text.length === 0 || text.length > MAX_BYTES) return new NextResponse(null, { status: 204 })
  let body: unknown
  try { body = JSON.parse(text) } catch { return new NextResponse(null, { status: 204 }) }

  for (const v of parseCspReports(body)) console.warn('[csp-violation]', JSON.stringify(v))
  return new NextResponse(null, { status: 204 })
}
