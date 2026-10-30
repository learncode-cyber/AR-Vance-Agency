import PDFDocument from 'pdfkit'
import { formatDate } from '@/lib/export/format'
import { makeTextTools, registerFonts } from '@/lib/export/pdf'
import type { InvoiceItem } from '@/lib/invoices'

export interface InvoicePdfData {
  number: string
  status: string
  currency: string
  issueDate: Date
  dueDate: Date
  billToName: string
  billToEmail: string
  billToAddress?: string | null
  items: InvoiceItem[]
  subtotal: number
  discount: number
  taxRate: number
  taxAmount: number
  total: number
  notes?: string | null
  issuer: { name: string; email?: string; address?: string }
}

const money = (n: number, cur: string) => `${cur} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const num = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** A multi-page invoice PDF (Latin + Bengali text), laid out like a normal invoice. */
export function renderInvoicePdf(inv: InvoicePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const M = 48
      const doc = new PDFDocument({ size: 'A4', margin: M, bufferPages: true, info: { Title: `Invoice ${inv.number}`, Author: inv.issuer.name, Creator: 'AR Vance Agency OS' } })
      const chunks: Buffer[] = []
      doc.on('data', (c: Buffer) => chunks.push(c))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)
      registerFonts(doc)
      const t = makeTextTools(doc, 10)
      const W = doc.page.width - M * 2
      const right = M + W

      t.draw(inv.issuer.name, M, M, W * 0.6, { bold: true, size: 18 })
      let hy = M + 26
      if (inv.issuer.email) { t.draw(inv.issuer.email, M, hy, W * 0.6, { color: '#4B5563' }); hy += 14 }
      if (inv.issuer.address) { t.draw(inv.issuer.address, M, hy, W * 0.6, { color: '#4B5563' }); hy += 14 }
      t.draw('INVOICE', right - 200, M, 200, { bold: true, size: 22, right: true, color: '#1F2937' })
      t.draw(inv.number, right - 200, M + 28, 200, { right: true, bold: true })
      t.draw(`Status: ${inv.status.toUpperCase()}`, right - 200, M + 44, 200, { right: true, color: inv.status === 'paid' ? '#047857' : inv.status === 'void' ? '#B91C1C' : '#4B5563' })

      let y = Math.max(hy, M + 62) + 16
      t.draw('BILL TO', M, y, 200, { bold: true, color: '#6B7280', size: 8 })
      t.draw(inv.billToName, M, y + 14, W * 0.55, { bold: true })
      t.draw(inv.billToEmail, M, y + 28, W * 0.55, { color: '#4B5563' })
      let by = y + 42
      if (inv.billToAddress) for (const line of inv.billToAddress.split(/\r?\n/).slice(0, 4)) { t.draw(line, M, by, W * 0.55, { color: '#4B5563' }); by += 14 }
      t.draw('Issued', right - 200, y, 90, { color: '#6B7280' }); t.draw(formatDate(inv.issueDate), right - 100, y, 100, { right: true })
      t.draw('Due', right - 200, y + 14, 90, { color: '#6B7280' }); t.draw(formatDate(inv.dueDate), right - 100, y + 14, 100, { right: true })
      y = Math.max(by, y + 42) + 18

      const col = { desc: M, qty: M + W * 0.56, price: M + W * 0.68, amt: M + W * 0.84 }
      const header = () => {
        doc.rect(M, y, W, 22).fill('#1F2937')
        t.draw('Description', col.desc + 6, y + 6, W * 0.5, { bold: true, color: '#FFFFFF' })
        t.draw('Qty', col.qty, y + 6, W * 0.1, { bold: true, color: '#FFFFFF', right: true })
        t.draw('Unit price', col.price, y + 6, W * 0.15, { bold: true, color: '#FFFFFF', right: true })
        t.draw('Amount', col.amt, y + 6, W * 0.16 - 6, { bold: true, color: '#FFFFFF', right: true })
        y += 22
      }
      header()
      inv.items.forEach((it, i) => {
        if (y + 24 > doc.page.height - M - 150) { doc.addPage(); y = M; header() }
        if (i % 2 === 1) doc.rect(M, y, W, 22).fill('#F3F4F6')
        t.draw(it.description, col.desc + 6, y + 6, W * 0.52, {})
        t.draw(String(it.quantity), col.qty, y + 6, W * 0.1, { right: true })
        t.draw(num(it.unitPrice), col.price, y + 6, W * 0.15, { right: true })
        t.draw(num(Math.round(it.quantity * it.unitPrice * 100) / 100), col.amt, y + 6, W * 0.16 - 6, { right: true })
        y += 22
      })

      if (y + 110 > doc.page.height - M) { doc.addPage(); y = M }
      y += 12
      const line = (label: string, value: string, bold = false) => {
        t.draw(label, right - 230, y, 120, { bold, color: bold ? '#111827' : '#4B5563' })
        t.draw(value, right - 110, y, 110, { bold, right: true })
        y += 16
      }
      line('Subtotal', money(inv.subtotal, inv.currency))
      if (inv.discount > 0) line('Discount', `- ${money(inv.discount, inv.currency)}`)
      if (inv.taxRate > 0) line(`Tax (${inv.taxRate}%)`, money(inv.taxAmount, inv.currency))
      doc.moveTo(right - 230, y + 2).lineTo(right, y + 2).strokeColor('#9CA3AF').lineWidth(0.5).stroke()
      y += 8
      line('Total', money(inv.total, inv.currency), true)

      if (inv.notes) {
        y += 14
        t.draw('Notes', M, y, W, { bold: true, color: '#6B7280', size: 8 }); y += 14
        for (const ln of inv.notes.split(/\r?\n/).slice(0, 8)) { t.draw(ln, M, y, W, { color: '#374151' }); y += 13 }
      }

      const range = doc.bufferedPageRange()
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(range.start + i)
        t.draw(`${inv.number} · Page ${i + 1} of ${range.count}`, M, doc.page.height - M + 8, W, { color: '#9CA3AF', size: 8, right: true })
      }
      doc.end()
    } catch (e) {
      reject(e)
    }
  })
}
