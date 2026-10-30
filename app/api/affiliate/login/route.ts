import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/email'
import { VERIFY_TTL_MS, hashToken, newVerifyToken } from '@/lib/affiliate-auth'

const schema = z.object({ email: z.string().trim().email().max(200) })

// Sends a one-time sign-in link to an ACTIVE affiliate. The response is identical whether or not
// the address exists, so this can't be used to find affiliates.
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'affiliate-login', 10, 60 * 60)).success) return NextResponse.json({ error: 'Too many attempts. Try later.' }, { status: 429 })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Enter a valid email' }, { status: 400 })
  const generic = NextResponse.json({ success: true, message: 'If this email belongs to an active affiliate, a sign-in link is on its way.' }, { status: 202 })

  const email = parsed.data.email.toLowerCase()
  const aff = await prisma.affiliate.findUnique({ where: { email } })
  if (!aff || aff.status !== 'active') return generic

  const token = newVerifyToken()
  await prisma.affiliate.update({ where: { id: aff.id }, data: { loginTokenHash: hashToken(token), loginExpiresAt: new Date(Date.now() + 15 * 60_000) } })
  const base = process.env.NEXT_PUBLIC_SITE_URL || ''
  const link = `${base}/affiliate/login?token=${encodeURIComponent(token)}`
  await sendEmail({
    to: email,
    subject: 'Your affiliate dashboard sign-in link',
    html: `<p>Hi ${aff.name.replace(/[<>&]/g, '')},</p><p>Sign in to your affiliate dashboard (link valid for 15 minutes, single use):</p><p><a href="${link}">${link}</a></p>`,
    text: `Sign in to your affiliate dashboard (valid 15 minutes): ${link}`,
  })
  return generic
}
void VERIFY_TTL_MS
