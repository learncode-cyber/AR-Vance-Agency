import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { rateLimit } from '@/lib/rate-limit'
import { decryptSecret, generateBackupCodes } from '@/lib/two-factor'
import { verifyTotp } from '@/lib/totp'

const schema = z.object({ code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code') })

// Step 2: confirm the user's authenticator works, then turn 2FA on and
// return one-time backup codes (shown once, stored only as hashes).
export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const limit = await rateLimit(session.userId, '2fa-enable', 10, 15 * 60)
  if (!limit.success) return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid code' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user?.twoFactorSecret) return NextResponse.json({ error: 'Start setup first.' }, { status: 400 })
  if (user.twoFactorEnabled) return NextResponse.json({ error: 'Already enabled.' }, { status: 409 })

  const step = verifyTotp(decryptSecret(user.twoFactorSecret), parsed.data.code)
  if (step === null) return NextResponse.json({ error: 'Invalid code. Check your authenticator and try again.' }, { status: 400 })

  const { plain, hashes } = generateBackupCodes()
  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: true, twoFactorBackupCodes: JSON.stringify(hashes), twoFactorLastStep: step },
  })

  return NextResponse.json({ success: true, backupCodes: plain })
}
