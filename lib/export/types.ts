export type ExportFormat = 'pdf' | 'xlsx' | 'csv' | 'docx'
export type ColumnType = 'text' | 'number' | 'currency' | 'date' | 'datetime' | 'boolean'

export interface ExportColumn {
  key: string
  label: string
  type?: ColumnType
  /** Relative width hint (PDF/Excel). */
  width?: number
}

export interface ExportTable {
  title: string
  subtitle?: string
  columns: ExportColumn[]
  rows: Record<string, unknown>[]
  generatedAt?: Date
}

export const MAX_EXPORT_ROWS = 10_000

export const MIME: Record<ExportFormat, string> = {
  pdf: 'application/pdf',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv; charset=utf-8',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

export function isExportFormat(v: string | null | undefined): v is ExportFormat {
  return v === 'pdf' || v === 'xlsx' || v === 'csv' || v === 'docx'
}
