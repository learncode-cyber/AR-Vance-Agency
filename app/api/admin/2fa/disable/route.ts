import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { rateLimit } from '@/lib/rate-limit'
import { verifyPassword } from '@/lib/auth'
import { checkTwoFactor } from '@/lib/two-factor'

const schema = z.object({ password: z.string().min(1), code: z.string().min(6).max(12) })

// Disabling needs BOTH the password and a valid 2FA/backup code, so a stolen
// session cookie alone cannot strip the second factor.
export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const limit = await rateLimit(session.userId, '2fa-disable', 5, 15 * 60)
  if (!limit.success) return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Password and code are required.' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user || !user.twoFactorEnabled) return NextResponse.json({ error: '2FA is not enabled.' }, { status: 400 })

  const pwOk = await verifyPassword(parsed.data.password, user.passwordHash)
  const tf = checkTwoFactor(user, parsed.data.code)
  if (!pwOk || !tf.ok) return NextResponse.json({ error: 'Invalid password or code.' }, { status: 401 })

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null, twoFactorBackupCodes: null, twoFactorLastStep: null },
  })
  return NextResponse.json({ success: true })
}
