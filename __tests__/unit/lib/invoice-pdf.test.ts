/** @jest-environment node */
import { renderInvoicePdf } from '@/lib/invoice-pdf'

describe('invoice PDF', () => {
  it('renders a real PDF with Bengali customer names and totals', async () => {
    const buf = await renderInvoicePdf({
      number: 'INV-2026-0001', status: 'sent', currency: 'BDT', issueDate: new Date('2026-10-01T00:00:00Z'), dueDate: new Date('2026-10-15T00:00:00Z'),
      billToName: 'আরিফ হোসেন', billToEmail: 'arif@example.com', billToAddress: 'ঢাকা\nBangladesh',
      items: Array.from({ length: 40 }, (_, i) => ({ description: `Service item ${i} — সেবা`, quantity: 2, unitPrice: 1500.5 })),
      subtotal: 120040, discount: 0, taxRate: 10, taxAmount: 12004, total: 132044,
      notes: 'Thank you for your business.', issuer: { name: 'AR Vance Agency', email: 'hello@arvance.example' },
    })
    expect(buf.subarray(0, 5).toString('latin1')).toBe('%PDF-')
    expect((buf.toString('latin1').match(/\/Type \/Page\b/g) ?? []).length).toBeGreaterThan(1)
  })
})
