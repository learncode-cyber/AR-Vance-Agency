import { prisma } from '@/lib/prisma'
import { getSettings } from '@/lib/settings'
import { invoiceItemSchema, type InvoiceItem } from '@/lib/invoices'

/** Issuer details for the invoice header (from the admin Settings row, with safe fallbacks). */
export async function settingsOrDefault() {
  const s = (await getSettings().catch(() => null)) as Record<string, unknown> | null
  const str = (k: string, d: string) => (typeof s?.[k] === 'string' && s[k] ? (s[k] as string) : d)
  return {
    siteName: str('siteName', 'AR Vance Agency'),
    contactEmail: str('contactEmail', ''),
    address: str('address', ''),
  }
}

/** Parse stored invoice items defensively: a corrupted row must not crash the PDF. */
export function invoiceItemsOf(raw: string): InvoiceItem[] {
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.map((x) => invoiceItemSchema.safeParse(x)).filter((r) => r.success).map((r) => (r as { data: InvoiceItem }).data) : []
  } catch {
    return []
  }
}

export { prisma }
