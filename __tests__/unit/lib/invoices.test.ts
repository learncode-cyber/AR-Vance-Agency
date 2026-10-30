import { computeTotals, canTransition, invoiceNumber, createInvoiceSchema } from '@/lib/invoices'

describe('invoices', () => {
  it('computes totals in integer cents (no float drift)', () => {
    const t = computeTotals([{ description: 'a', quantity: 3, unitPrice: 0.1 }], 0, 0)
    expect(t.subtotal).toBe(0.3); expect(t.total).toBe(0.3)
  })
  it('applies discount before tax and never discounts below zero', () => {
    const t = computeTotals([{ description: 'a', quantity: 2, unitPrice: 100 }], 10, 50)
    expect(t).toEqual({ subtotal: 200, discount: 50, taxAmount: 15, total: 165 })
    expect(computeTotals([{ description: 'a', quantity: 1, unitPrice: 10 }], 0, 999).total).toBe(0)
  })
  it('numbers invoices per year with padding', () => { expect(invoiceNumber(2026, 7)).toBe('INV-2026-0007') })
  it('status flow: draft→sent→paid, paid/void are final, no skipping back', () => {
    expect(canTransition('draft', 'sent')).toBe(true); expect(canTransition('sent', 'paid')).toBe(true)
    expect(canTransition('draft', 'paid')).toBe(true); expect(canTransition('sent', 'void')).toBe(true)
    expect(canTransition('paid', 'void')).toBe(false); expect(canTransition('void', 'sent')).toBe(false)
    expect(canTransition('sent', 'draft')).toBe(false); expect(canTransition('sent', 'sent')).toBe(false)
  })
  it('validates input: positive quantity, valid email, known currency, item cap', () => {
    const base = { billTo: { name: 'A', email: 'a@example.com' }, items: [{ description: 'x', quantity: 1, unitPrice: 5 }] }
    expect(createInvoiceSchema.safeParse(base).success).toBe(true)
    expect(createInvoiceSchema.safeParse({ ...base, items: [{ description: 'x', quantity: 0, unitPrice: 5 }] }).success).toBe(false)
    expect(createInvoiceSchema.safeParse({ ...base, billTo: { name: 'A', email: 'nope' } }).success).toBe(false)
    expect(createInvoiceSchema.safeParse({ ...base, currency: 'XXX' }).success).toBe(false)
    expect(createInvoiceSchema.safeParse({ ...base, items: Array.from({ length: 101 }, () => base.items[0]) }).success).toBe(false)
  })
})
