import ExcelJS from 'exceljs'
import { cleanText, formatDate } from './format'
import type { ExportColumn, ExportTable } from './types'

const SHEET_BAD = /[\\/?*[\]:]/g

function toCell(value: unknown, col: ExportColumn): ExcelJS.CellValue {
  if (value === null || value === undefined) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') { try { return cleanText(JSON.stringify(value)) } catch { return null } }
  const s = cleanText(String(value))
  if ((col.type === 'date' || col.type === 'datetime') && s) { const d = new Date(s); if (!Number.isNaN(d.getTime())) return d }
  // Strings are written as plain strings (never as formulas), so "=1+1" stays text in the cell.
  return s
}

function lenOf(v: unknown): number {
  if (v instanceof Date) return formatDate(v).length
  return v === null || v === undefined ? 0 : String(v).length
}

/** A real .xlsx workbook: typed numbers/dates, styled + frozen header, filter, sensible widths. */
export async function renderXlsx(table: ExportTable): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'AR Vance Agency OS'
  wb.created = table.generatedAt ?? new Date()
  const ws = wb.addWorksheet((cleanText(table.title).replace(SHEET_BAD, ' ').trim() || 'Export').slice(0, 31))

  ws.columns = table.columns.map((c) => ({ header: c.label, key: c.key, width: c.width ?? 18 }))
  const header = ws.getRow(1)
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } }
  header.alignment = { vertical: 'middle' }
  header.height = 22

  for (const row of table.rows) {
    const r: Record<string, ExcelJS.CellValue> = {}
    for (const c of table.columns) r[c.key] = toCell(row[c.key], c)
    ws.addRow(r)
  }

  table.columns.forEach((c, i) => {
    const col = ws.getColumn(i + 1)
    if (c.type === 'currency') col.numFmt = '#,##0.00'
    else if (c.type === 'date') col.numFmt = 'yyyy-mm-dd'
    else if (c.type === 'datetime') col.numFmt = 'yyyy-mm-dd hh:mm'
    if (!c.width) {
      let max = c.label.length
      for (const row of table.rows.slice(0, 500)) max = Math.max(max, lenOf(row[c.key]))
      col.width = Math.min(Math.max(max + 2, 10), 60)
    }
  })

  ws.views = [{ state: 'frozen', ySplit: 1 }]
  if (table.columns.length > 0) ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: table.columns.length } }

  const out = await wb.xlsx.writeBuffer()
  return Buffer.from(out as ArrayBuffer)
}
