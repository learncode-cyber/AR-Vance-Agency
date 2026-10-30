import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AFF_REF_COOKIE, cookieOptions } from '@/lib/affiliate-session'

// Referral link landing: remembers the code for 30 days (first-party cookie), then sends the
// visitor to the shop. Unknown or inactive codes are ignored silently.
export async function GET(req: NextRequest) {
  const code = (req.nextUrl.searchParams.get('ref') || '').trim().toUpperCase()
  const to = new URL('/shop', req.url)
  const res = NextResponse.redirect(to)
  if (/^[A-Z0-9]{8}$/.test(code)) {
    const aff = await prisma.affiliate.findUnique({ where: { code }, select: { status: true } })
    if (aff?.status === 'active') res.cookies.set(AFF_REF_COOKIE, code, cookieOptions(30 * 24 * 60 * 60))
  }
  return res
}
