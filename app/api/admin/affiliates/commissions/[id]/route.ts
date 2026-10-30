import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'

// Allowed moves: pending→approved, approved→paid, pending|approved→reversed. Paid and reversed are final.
const NEXT: Record<string, string[]> = { pending: ['approved', 'reversed'], approved: ['paid', 'reversed'], paid: [], reversed: [] }
const schema = z.object({ status: z.enum(['approved', 'paid', 'reversed']) })

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()
  if (!(await hasPermission(session.userId, 'manage_commerce'))) return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
  const { id } = await params
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'status must be approved, paid or reversed' }, { status: 400 })
  const c = await prisma.affiliateCommission.findUnique({ where: { id } })
  if (!c) return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
  if (!(NEXT[c.status] ?? []).includes(parsed.data.status)) return NextResponse.json({ error: `Cannot move a ${c.status} commission to ${parsed.data.status}` }, { status: 409 })
  const now = new Date()
  const data = parsed.data.status === 'approved' ? { status: 'approved', approvedAt: now }
    : parsed.data.status === 'paid' ? { status: 'paid', paidAt: now }
    : { status: 'reversed' }
  const updated = await prisma.affiliateCommission.update({ where: { id }, data })
  await logActivity(session.userId, `affiliate_commission_${parsed.data.status}`, 'affiliate_commission', id, c.orderNumber, { amount: c.amount })
  return NextResponse.json({ data: updated })
}
