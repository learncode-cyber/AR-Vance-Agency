import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'
import { renderInvoicePdf } from '@/lib/invoice-pdf'
import { settingsOrDefault, invoiceItemsOf } from '@/lib/invoice-data'
import { safeFileName } from '@/lib/export/format'

// Download any invoice as a real PDF.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()
  if (!(await hasPermission(session.userId, 'manage_commerce'))) return NextResponse.json({ error: 'Access Denied' }, { status: 403 })

  const { id } = await params
  const inv = await prisma.invoice.findUnique({ where: { id } })
  if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  try {
    const settings = await settingsOrDefault()
    const pdf = await renderInvoicePdf({
      number: inv.number, status: inv.status, currency: inv.currency, issueDate: inv.issueDate, dueDate: inv.dueDate,
      billToName: inv.billToName, billToEmail: inv.billToEmail, billToAddress: inv.billToAddress,
      items: invoiceItemsOf(inv.items), subtotal: inv.subtotal, discount: inv.discount, taxRate: inv.taxRate,
      taxAmount: inv.taxAmount, total: inv.total, notes: inv.notes,
      issuer: { name: settings.siteName, email: settings.contactEmail, address: settings.address },
    })
    return new Response(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFileName(inv.number)}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Invoice PDF error:', (error as Error).name)
    return NextResponse.json({ error: 'Failed to build PDF' }, { status: 500 })
  }
}
