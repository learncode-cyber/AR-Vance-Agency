import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/email'
import { VERIFY_TTL_MS, hashToken, newReferralCode, newVerifyToken } from '@/lib/affiliate-auth'

const schema = z.object({ email: z.string().trim().email().max(200), name: z.string().trim().min(2).max(120) })

// Real affiliate sign-up: stores a pending affiliate, emails a one-time verification link
// (48h). The response is identical whether or not the email already exists, so the form
// can't be used to discover registered addresses.
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'affiliate-register', 5, 60 * 60)).success) return NextResponse.json({ error: 'Too many attempts. Try later.' }, { status: 429 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Enter a valid name and email' }, { status: 400 })
  const { email, name } = parsed.data
  const generic = NextResponse.json({ success: true, message: 'Check your email for a verification link.' }, { status: 202 })

  try {
    const existing = await prisma.affiliate.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) return generic
    const token = newVerifyToken()
    let code = newReferralCode()
    for (let i = 0; i < 3 && (await prisma.affiliate.findUnique({ where: { code } })); i++) code = newReferralCode()
    await prisma.affiliate.create({
      data: { email: email.toLowerCase(), name, code, status: 'pending', verifyTokenHash: hashToken(token), verifyExpiresAt: new Date(Date.now() + VERIFY_TTL_MS) },
    })
    const base = process.env.NEXT_PUBLIC_SITE_URL || ''
    const link = `${base}/affiliate/verify?token=${encodeURIComponent(token)}`
    await sendEmail({
      to: email.toLowerCase(),
      subject: 'Confirm your affiliate account',
      html: `<p>Hi ${name.replace(/[<>&]/g, '')},</p><p>Confirm your affiliate account within 48 hours:</p><p><a href="${link}">${link}</a></p><p>If you did not sign up, ignore this email.</p>`,
      text: `Confirm your affiliate account (48 hours): ${link}`,
    })
    return generic
  } catch (error) {
    console.error('Affiliate register error:', (error as Error).name)
    return generic
  }
}
