import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { generateSecret, otpauthUrl } from '@/lib/totp'
import { encryptSecret } from '@/lib/two-factor'

// Step 1: create a pending secret. 2FA is NOT active until /enable confirms a code.
export async function POST() {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return unauthorized()
  if (user.twoFactorEnabled) {
    return NextResponse.json({ error: 'Two-factor authentication is already enabled.' }, { status: 409 })
  }

  const secret = generateSecret()
  await prisma.user.update({ where: { id: user.id }, data: { twoFactorSecret: encryptSecret(secret) } })

  return NextResponse.json({
    secret,
    otpauthUrl: otpauthUrl({ secret, account: user.email, issuer: 'AR Vance Admin' }),
  })
}
