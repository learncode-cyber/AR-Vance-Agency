import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'
import { canTransition, type InvoiceStatus } from '@/lib/invoices'

const schema = z.object({ status: z.enum(['paid', 'void']) })

// Mark an invoice paid or void. Allowed transitions are enforced server-side (paid/void are final).
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()
  if (!(await hasPermission(session.userId, 'manage_commerce'))) return NextResponse.json({ error: 'Access Denied' }, { status: 403 })

  const { id } = await params
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'status must be paid or void' }, { status: 400 })

  const inv = await prisma.invoice.findUnique({ where: { id } })
  if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  if (!canTransition(inv.status as InvoiceStatus, parsed.data.status)) {
    return NextResponse.json({ error: `Cannot change a ${inv.status} invoice to ${parsed.data.status}` }, { status: 409 })
  }
  const updated = await prisma.invoice.update({
    where: { id },
    data: { status: parsed.data.status, ...(parsed.data.status === 'paid' ? { paidAt: new Date() } : {}) },
  })
  await logActivity(session.userId, `invoice_${parsed.data.status}`, 'invoice', id, inv.number)
  return NextResponse.json({ data: { id: updated.id, number: updated.number, status: updated.status } })
}
