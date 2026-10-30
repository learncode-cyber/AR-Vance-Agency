import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashToken } from '@/lib/affiliate-auth'
import { AFF_SESSION_COOKIE, SESSION_SECONDS, cookieOptions, createAffiliateSession } from '@/lib/affiliate-session'

const schema = z.object({ token: z.string().min(20).max(200) })

// Exchanges a valid, unexpired, unused sign-in link for a 30-day session cookie. Single use.
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'This sign-in link is invalid or has expired.' }, { status: 400 })
  const aff = await prisma.affiliate.findUnique({ where: { loginTokenHash: hashToken(parsed.data.token) } })
  if (!aff || aff.status !== 'active' || !aff.loginExpiresAt || aff.loginExpiresAt < new Date()) {
    return NextResponse.json({ error: 'This sign-in link is invalid or has expired.' }, { status: 400 })
  }
  await prisma.affiliate.update({ where: { id: aff.id }, data: { loginTokenHash: null, loginExpiresAt: null, lastLoginAt: new Date() } })
  ;(await cookies()).set(AFF_SESSION_COOKIE, createAffiliateSession(aff.id), cookieOptions(SESSION_SECONDS))
  return NextResponse.json({ success: true })
}
