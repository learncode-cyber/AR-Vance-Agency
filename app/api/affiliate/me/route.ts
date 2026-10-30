import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { AFF_SESSION_COOKIE, readAffiliateSession } from '@/lib/affiliate-session'

// The signed-in affiliate's real numbers: from the commission table, never sample data.
export async function GET() {
  const id = readAffiliateSession((await cookies()).get(AFF_SESSION_COOKIE)?.value)
  if (!id) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const aff = await prisma.affiliate.findUnique({ where: { id }, select: { name: true, email: true, code: true, status: true, commissionRate: true, createdAt: true } })
  if (!aff || aff.status !== 'active') return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const [byStatus, recent] = await Promise.all([
    prisma.affiliateCommission.groupBy({ by: ['status'], where: { affiliateId: id }, _sum: { amount: true }, _count: { _all: true } }),
    prisma.affiliateCommission.findMany({ where: { affiliateId: id }, orderBy: { createdAt: 'desc' }, take: 50, select: { orderNumber: true, orderTotal: true, amount: true, status: true, createdAt: true } }),
  ])
  const sum = (st: string) => byStatus.find((g) => g.status === st)?.['_sum']?.amount ?? 0
  const count = (st: string) => byStatus.find((g) => g.status === st)?.['_count']?._all ?? 0
  return NextResponse.json({
    data: {
      name: aff.name, code: aff.code, commissionRate: aff.commissionRate,
      referralLink: `/api/affiliate/track?ref=${aff.code}`,
      totals: {
        pending: sum('pending'), approved: sum('approved'), paid: sum('paid'), reversed: sum('reversed'),
        orders: byStatus.reduce((n, g) => n + (g['_count']?._all ?? 0), 0), payable: sum('approved'), counted: count('pending') + count('approved') + count('paid'),
      },
      commissions: recent.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
    },
  })
}
