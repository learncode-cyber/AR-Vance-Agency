import path from 'path'
import PDFDocument from 'pdfkit'
import { cellText, formatDate } from './format'
import type { ExportTable } from './types'

// Real PDF generation with pdfkit. Latin text uses Noto Sans and Bengali (বাংলা) text uses
// Noto Sans Bengali, both embedded from the @fontsource packages, so names/messages in
// either script render correctly instead of as empty boxes. Strings are split into
// script runs and drawn with the matching font.
const fontFile = (pkg: string, file: string) => path.join(process.cwd(), 'node_modules', '@fontsource', pkg, 'files', file)
const FONTS = {
  Latin: fontFile('noto-sans', 'noto-sans-latin-400-normal.woff'),
  LatinBold: fontFile('noto-sans', 'noto-sans-latin-700-normal.woff'),
  Bn: fontFile('noto-sans-bengali', 'noto-sans-bengali-bengali-400-normal.woff'),
  BnBold: fontFile('noto-sans-bengali', 'noto-sans-bengali-bengali-700-normal.woff'),
}

type Run = { text: string; bn: boolean }
function toRuns(text: string): Run[] {
  const runs: Run[] = []
  for (const part of text.split(/([\u0980-\u09FF\u200C\u200D]+)/)) {
    if (!part) continue
    runs.push({ text: part, bn: /[\u0980-\u09FF]/.test(part) })
  }
  return runs
}

const MARGIN = 36
const ROW_H = 20
const FONT_SIZE = 9

/** Register the embedded Latin + Bengali fonts on a pdfkit document. */
export function registerFonts(doc: PDFKit.PDFDocument): void {
  for (const [name, file] of Object.entries(FONTS)) doc.registerFont(name, file)
}

/** Mixed-script text helpers (measure / truncate / draw) shared by every PDF we generate. */
export function makeTextTools(doc: PDFKit.PDFDocument, fontSize = FONT_SIZE) {
  const fontFor = (run: Run, bold: boolean) => (run.bn ? (bold ? 'BnBold' : 'Bn') : bold ? 'LatinBold' : 'Latin')
  const width = (text: string, bold = false, size = fontSize) =>
    toRuns(text).reduce((w, r) => w + doc.font(fontFor(r, bold)).fontSize(size).widthOfString(r.text), 0)
  const fit = (text: string, maxW: number, bold = false, size = fontSize): string => {
    if (width(text, bold, size) <= maxW) return text
    const chars = Array.from(text)
    while (chars.length > 0 && width(chars.join('') + '…', bold, size) > maxW) chars.pop()
    return chars.join('') + '…'
  }
  const draw = (text: string, x: number, y: number, maxW: number, opts: { bold?: boolean; right?: boolean; color?: string; size?: number } = {}) => {
    const size = opts.size ?? fontSize
    const bold = !!opts.bold
    const shown = fit(text, maxW, bold, size)
    let cx = opts.right ? x + maxW - width(shown, bold, size) : x
    for (const r of toRuns(shown)) {
      doc.font(fontFor(r, bold)).fontSize(size).fillColor(opts.color ?? '#111827')
      // Noto Sans Bengali sits visually higher than Noto Sans at the same y — nudge it down.
      doc.text(r.text, cx, y + (r.bn ? size * 0.14 : 0), { lineBreak: false })
      cx += doc.widthOfString(r.text)
    }
  }
  return { width, fit, draw, fontFor }
}

export function renderPdf(table: ExportTable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const landscape = table.columns.length > 5
      const doc = new PDFDocument({
        size: 'A4',
        layout: landscape ? 'landscape' : 'portrait',
        margin: MARGIN,
        bufferPages: true,
        info: { Title: table.title, Author: 'AR Vance Agency OS', Creator: 'AR Vance Agency OS' },
      })
      const chunks: Buffer[] = []
      doc.on('data', (c: Buffer) => chunks.push(c))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      registerFonts(doc)
      const t = makeTextTools(doc)

      const pageW = doc.page.width - MARGIN * 2
      t.draw(table.title, MARGIN, MARGIN, pageW, { bold: true, size: 18 })
      let y = MARGIN + 28
      if (table.subtitle) { t.draw(table.subtitle, MARGIN, y, pageW, { color: '#374151' }); y += 14 }
      t.draw(`Generated ${formatDate(table.generatedAt ?? new Date(), true)} · ${table.rows.length} row(s)`, MARGIN, y, pageW, { color: '#6B7280' })
      y += 22

      // column widths: proportional to a hint or to content length, then scaled to the page
      const texts = table.rows.map((row) => table.columns.map((c) => cellText(row[c.key], c)))
      const weights = table.columns.map((c, i) => {
        if (c.width) return c.width
        let max = c.label.length
        for (const tx of texts.slice(0, 200)) max = Math.max(max, tx[i].length)
        return Math.min(Math.max(max, 6), 38)
      })
      const total = weights.reduce((a, b) => a + b, 0) || 1
      const widths = weights.map((w) => (w / total) * pageW)
      const xs = widths.reduce<number[]>((acc, _w, i) => { acc.push(i === 0 ? MARGIN : acc[i - 1] + widths[i - 1]); return acc }, [])

      const drawHeader = () => {
        doc.rect(MARGIN, y, pageW, ROW_H).fill('#1F2937')
        table.columns.forEach((c, i) => t.draw(c.label, xs[i] + 4, y + 6, widths[i] - 8, { bold: true, color: '#FFFFFF' }))
        y += ROW_H
      }
      const bottom = () => doc.page.height - MARGIN - 18

      drawHeader()
      texts.forEach((cells, r) => {
        if (y + ROW_H > bottom()) { doc.addPage(); y = MARGIN; drawHeader() }
        if (r % 2 === 1) doc.rect(MARGIN, y, pageW, ROW_H).fill('#F3F4F6')
        cells.forEach((tx, i) => {
          const type = table.columns[i].type
          t.draw(tx, xs[i] + 4, y + 6, widths[i] - 8, { right: type === 'number' || type === 'currency' })
        })
        y += ROW_H
      })
      if (texts.length === 0) t.draw('No data', MARGIN + 4, y + 6, pageW, { color: '#6B7280' })

      const range = doc.bufferedPageRange()
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(range.start + i)
        const label = `Page ${i + 1} of ${range.count}`
        const lw = t.width(label)
        t.draw(label, MARGIN + pageW - lw, doc.page.height - MARGIN - 6, lw + 2, { color: '#6B7280' })
      }
      doc.end()
    } catch (e) {
      reject(e)
    }
  })
}
