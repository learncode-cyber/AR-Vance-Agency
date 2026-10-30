import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken, COOKIE_NAME, COOKIE_OPTIONS } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { checkTwoFactor } from '@/lib/two-factor'

const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
  totp:     z.string().max(16).optional(),   // 6-digit code or backup code
})

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)

    // IP-wide throttle: catches spraying many emails from one source.
    const ipLimit = await rateLimit(ip, 'login', 20, 15 * 60)
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email or password format.' }, { status: 400 })
    }

    const { email, password, totp } = parsed.data

    // Per-account throttle: catches targeted brute force on one email.
    const accountLimit = await rateLimit(email.toLowerCase(), 'login', 5, 15 * 60)
    if (!accountLimit.success) {
      return NextResponse.json(
        { error: 'Too many login attempts for this account. Please try again later.' },
        { status: 429 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
    }

    // Optional 2FA: only enforced for accounts that turned it on.
    if (user.twoFactorEnabled) {
      if (!totp) {
        return NextResponse.json({ error: 'Two-factor code required.', twoFactorRequired: true }, { status: 401 })
      }
      const tf = checkTwoFactor(user, totp)
      if (!tf.ok) {
        return NextResponse.json({ error: 'Invalid two-factor code.', twoFactorRequired: true }, { status: 401 })
      }
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(tf.newLastStep !== undefined ? { twoFactorLastStep: tf.newLastStep } : {}),
          ...(tf.remainingBackupHashes ? { twoFactorBackupCodes: JSON.stringify(tf.remainingBackupHashes) } : {}),
        },
      })
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role })
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS)

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, fullName: user.fullName } })
  } catch (err) {
    console.error('[auth/login]', err)
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 })
  }
}
