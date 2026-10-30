import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { hashToken } from '@/lib/affiliate-auth'

const schema = z.object({ token: z.string().min(20).max(200) })

// Confirms the emailed token: single use (the hash is cleared), expires after 48h.
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'affiliate-verify', 20, 60 * 60)).success) return NextResponse.json({ error: 'Too many attempts.' }, { status: 429 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 })
  const aff = await prisma.affiliate.findUnique({ where: { verifyTokenHash: hashToken(parsed.data.token) } })
  if (!aff || !aff.verifyExpiresAt || aff.verifyExpiresAt < new Date()) {
    return NextResponse.json({ error: 'This verification link is invalid or has expired.' }, { status: 400 })
  }
  const updated = await prisma.affiliate.update({
    where: { id: aff.id },
    data: { status: 'active', verifiedAt: new Date(), verifyTokenHash: null, verifyExpiresAt: null },
  })
  return NextResponse.json({ success: true, data: { code: updated.code, status: updated.status } })
}
