import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()
  if (!(await hasPermission(session.userId, 'manage_commerce'))) return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
  const status = new URL(req.url).searchParams.get('status')
  const rows = await prisma.invoice.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: { id: true, number: true, billToName: true, billToEmail: true, total: true, currency: true, status: true, dueDate: true, issueDate: true, sentAt: true, paidAt: true },
  })
  return NextResponse.json({ data: rows.map((r) => ({ ...r, dueDate: r.dueDate.toISOString(), issueDate: r.issueDate.toISOString(), sentAt: r.sentAt?.toISOString() ?? null, paidAt: r.paidAt?.toISOString() ?? null })) })
}
