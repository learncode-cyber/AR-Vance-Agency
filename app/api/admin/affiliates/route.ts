import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'

// Affiliates with their real commission totals, plus recent commissions to action.
export async function GET() {
  const session = await getAdminSession()
  if (!session) return unauthorized()
  if (!(await hasPermission(session.userId, 'manage_commerce'))) return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
  const [affiliates, commissions] = await Promise.all([
    prisma.affiliate.findMany({ orderBy: { createdAt: 'desc' }, take: 200, select: { id: true, name: true, email: true, code: true, status: true, commissionRate: true, verifiedAt: true, lastLoginAt: true } }),
    prisma.affiliateCommission.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
  ])
  const names = new Map(affiliates.map((a) => [a.id, a.name]))
  return NextResponse.json({
    data: {
      affiliates,
      commissions: commissions.map((c) => ({ ...c, affiliateName: names.get(c.affiliateId) ?? '—', createdAt: c.createdAt.toISOString(), approvedAt: c.approvedAt?.toISOString() ?? null, paidAt: c.paidAt?.toISOString() ?? null })),
    },
  })
}
