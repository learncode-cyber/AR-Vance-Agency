import Papa from 'papaparse'
import { cellText } from './format'
import type { ExportTable } from './types'

/**
 * UTF-8 CSV with BOM (so Excel opens Bangla/Unicode correctly) and spreadsheet
 * formula-injection protection: cells starting with = + - @ (or tab/CR) are prefixed with
 * an apostrophe by papaparse's `escapeFormulae`, so a lead who types `=HYPERLINK(...)` as their
 * name cannot execute anything when an admin opens the file.
 */
export function renderCsv(table: ExportTable): Buffer {
  const fields = table.columns.map((c) => c.label)
  const data = table.rows.map((row) => table.columns.map((c) => cellText(row[c.key], c)))
  const csv = Papa.unparse({ fields, data }, { newline: '\r\n', escapeFormulae: true })
  return Buffer.from('\uFEFF' + csv, 'utf8')
}
