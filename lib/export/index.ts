import { renderCsv } from './csv'
import { renderDocx } from './docx'
import { safeFileName } from './format'
import { renderPdf } from './pdf'
import { MAX_EXPORT_ROWS, MIME, type ExportFormat, type ExportTable } from './types'
import { renderXlsx } from './xlsx'

export * from './types'
export { cellText, formatDate, safeFileName } from './format'

export async function renderExport(format: ExportFormat, table: ExportTable): Promise<Buffer> {
  const t: ExportTable = { ...table, rows: table.rows.slice(0, MAX_EXPORT_ROWS), generatedAt: table.generatedAt ?? new Date() }
  switch (format) {
    case 'pdf': return renderPdf(t)
    case 'xlsx': return renderXlsx(t)
    case 'csv': return renderCsv(t)
    case 'docx': return renderDocx(t)
  }
}

/** A download Response with the right content type and a safe filename. */
export async function exportResponse(format: ExportFormat, table: ExportTable, baseName: string): Promise<Response> {
  const body = await renderExport(format, table)
  const stamp = new Date().toISOString().slice(0, 10)
  return new Response(new Uint8Array(body), {
    headers: {
      'Content-Type': MIME[format],
      'Content-Disposition': `attachment; filename="${safeFileName(baseName)}-${stamp}.${format}"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
