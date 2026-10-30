import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'
import { canTransition, type InvoiceStatus } from '@/lib/invoices'
import { sendEmail } from '@/lib/email'
import { renderInvoicePdf } from '@/lib/invoice-pdf'
import { settingsOrDefault, invoiceItemsOf } from '@/lib/invoice-data'

const schema = z.object({ invoiceId: z.string().min(1).max(64) })

// Emails the invoice as a real PDF attachment and moves it draft → sent. Sending to a
// different address than the one on the invoice is NOT allowed (prevents using the admin
// tool to mail arbitrary people).
export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()
  if (!(await hasPermission(session.userId, 'manage_commerce'))) return NextResponse.json({ error: 'Access Denied' }, { status: 403 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'invoiceId required' }, { status: 400 })
  const inv = await prisma.invoice.findUnique({ where: { id: parsed.data.invoiceId } })
  if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  if (inv.status === 'void' || inv.status === 'paid') return NextResponse.json({ error: `A ${inv.status} invoice cannot be sent` }, { status: 409 })

  try {
    const settings = await settingsOrDefault()
    const pdf = await renderInvoicePdf({
      number: inv.number, status: inv.status, currency: inv.currency, issueDate: inv.issueDate, dueDate: inv.dueDate,
      billToName: inv.billToName, billToEmail: inv.billToEmail, billToAddress: inv.billToAddress,
      items: invoiceItemsOf(inv.items), subtotal: inv.subtotal, discount: inv.discount, taxRate: inv.taxRate,
      taxAmount: inv.taxAmount, total: inv.total, notes: inv.notes,
      issuer: { name: settings.siteName, email: settings.contactEmail, address: settings.address },
    })
    const result = await sendEmail({
      to: inv.billToEmail,
      subject: `Invoice ${inv.number} from ${settings.siteName}`,
      html: `<p>Hello ${escape(inv.billToName)},</p><p>Please find invoice <strong>${escape(inv.number)}</strong> for <strong>${inv.currency} ${inv.total.toFixed(2)}</strong> attached (due ${inv.dueDate.toISOString().slice(0, 10)}).</p><p>Thank you,<br>${escape(settings.siteName)}</p>`,
      text: `Invoice ${inv.number} for ${inv.currency} ${inv.total.toFixed(2)} is attached.`,
      attachments: [{ filename: `${inv.number}.pdf`, content: pdf, contentType: 'application/pdf' }],
    } as Parameters<typeof sendEmail>[0])
    if (!result || (result as { success?: boolean }).success === false) {
      return NextResponse.json({ error: 'The invoice email could not be sent. Check SMTP settings.' }, { status: 502 })
    }

    const next: InvoiceStatus = canTransition(inv.status as InvoiceStatus, 'sent') ? 'sent' : (inv.status as InvoiceStatus)
    const updated = await prisma.invoice.update({ where: { id: inv.id }, data: { status: next, sentAt: new Date() } })
    await logActivity(session.userId, 'invoice_sent', 'invoice', inv.id, inv.number, { to: inv.billToEmail })
    return NextResponse.json({ data: { id: updated.id, number: updated.number, status: updated.status, sentTo: inv.billToEmail } })
  } catch (error) {
    console.error('Invoice send error:', (error as Error).name)
    return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 })
  }
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c])
}
