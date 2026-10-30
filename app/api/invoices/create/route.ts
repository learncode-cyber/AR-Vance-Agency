import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'
import { createInvoiceSchema, computeTotals, invoiceNumber } from '@/lib/invoices'

// Creates a REAL, numbered invoice (INV-YYYY-NNNN) stored in the database.
// Previously returned a random number and a fake id, and stored nothing.
export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()
  if (!(await hasPermission(session.userId, 'manage_commerce'))) return NextResponse.json({ error: 'Access Denied' }, { status: 403 })

  const parsed = createInvoiceSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid invoice' }, { status: 400 })
  const d = parsed.data

  try {
    const totals = computeTotals(d.items, d.taxRate, d.discount)
    const issueDate = new Date()
    const dueDate = new Date(issueDate.getTime() + d.dueInDays * 86_400_000)

    // Sequential number per year, retried on the (rare) unique-constraint race.
    const year = issueDate.getUTCFullYear()
    let invoice = null as Awaited<ReturnType<typeof prisma.invoice.create>> | null
    for (let attempt = 0; attempt < 5 && !invoice; attempt++) {
      const count = await prisma.invoice.count({ where: { number: { startsWith: `INV-${year}-` } } })
      try {
        invoice = await prisma.invoice.create({
          data: {
            number: invoiceNumber(year, count + 1 + attempt),
            clientId: d.clientId || null,
            billToName: d.billTo.name,
            billToEmail: d.billTo.email,
            billToAddress: d.billTo.address || null,
            currency: d.currency,
            items: JSON.stringify(d.items),
            subtotal: totals.subtotal,
            discount: totals.discount,
            taxRate: d.taxRate,
            taxAmount: totals.taxAmount,
            total: totals.total,
            status: 'draft',
            issueDate,
            dueDate,
            notes: d.notes || null,
            createdBy: session.userId,
          },
        })
      } catch (e) {
        if ((e as { code?: string }).code !== 'P2002') throw e
      }
    }
    if (!invoice) return NextResponse.json({ error: 'Could not allocate an invoice number, please retry' }, { status: 409 })

    await logActivity(session.userId, 'invoice_created', 'invoice', invoice.id, invoice.number)
    return NextResponse.json({ data: { id: invoice.id, number: invoice.number, status: invoice.status, total: invoice.total, currency: invoice.currency } }, { status: 201 })
  } catch (error) {
    console.error('Invoice create error:', (error as Error).name)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
