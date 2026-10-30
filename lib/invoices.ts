import { z } from 'zod'

export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'void'] as const
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'AUD', 'CAD', 'AED', 'SGD'] as const

export const invoiceItemSchema = z.object({
  description: z.string().trim().min(1).max(300),
  quantity: z.number().positive().max(1_000_000),
  unitPrice: z.number().min(0).max(100_000_000),
})
export type InvoiceItem = z.infer<typeof invoiceItemSchema>

export const createInvoiceSchema = z.object({
  clientId: z.string().max(64).optional(),
  billTo: z.object({
    name: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(200),
    address: z.string().trim().max(500).optional(),
  }),
  items: z.array(invoiceItemSchema).min(1).max(100),
  currency: z.enum(CURRENCIES).default('USD'),
  taxRate: z.number().min(0).max(100).default(0),
  discount: z.number().min(0).default(0),
  dueInDays: z.number().int().min(0).max(365).default(14),
  notes: z.string().trim().max(2000).optional(),
})
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>

/** Money math in integer cents to avoid floating-point drift (0.1 + 0.2 style errors). */
const cents = (n: number) => Math.round(n * 100)
const fromCents = (c: number) => c / 100

export function computeTotals(items: InvoiceItem[], taxRate: number, discount: number) {
  const subtotalC = items.reduce((s, i) => s + Math.round(i.quantity * cents(i.unitPrice)), 0)
  const discountC = Math.min(cents(discount), subtotalC) // a discount can never exceed the subtotal
  const taxableC = subtotalC - discountC
  const taxC = Math.round((taxableC * taxRate) / 100)
  return { subtotal: fromCents(subtotalC), discount: fromCents(discountC), taxAmount: fromCents(taxC), total: fromCents(taxableC + taxC) }
}

export const invoiceNumber = (year: number, seq: number) => `INV-${year}-${String(seq).padStart(4, '0')}`

/** Status flow: draft → sent → paid; any open invoice can be voided; paid/void are final. */
export function canTransition(from: InvoiceStatus, to: InvoiceStatus): boolean {
  if (from === to) return false
  if (from === 'paid' || from === 'void') return false
  if (to === 'void') return true
  if (to === 'paid') return from === 'sent' || from === 'draft'
  if (to === 'sent') return from === 'draft'
  return false
}
