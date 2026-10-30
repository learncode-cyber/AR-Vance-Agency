import type { ExportColumn } from './types'

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

export function cleanText(v: string): string {
  return v.replace(CONTROL, '')
}

const pad = (n: number) => String(n).padStart(2, '0')

/** All dates are rendered in UTC so exports are identical regardless of server timezone. */
export function formatDate(d: Date, withTime = false): string {
  if (Number.isNaN(d.getTime())) return ''
  const date = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
  return withTime ? `${date} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC` : date
}

/** Human-readable text for PDF/DOCX/CSV cells. */
export function cellText(value: unknown, col: ExportColumn): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return formatDate(value, col.type === 'datetime')
  if ((col.type === 'date' || col.type === 'datetime') && (typeof value === 'string' || typeof value === 'number')) {
    const d = new Date(value)
    if (!Number.isNaN(d.getTime())) return formatDate(d, col.type === 'datetime')
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return ''
    if (col.type === 'currency') return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return Number.isInteger(value) ? String(value) : value.toLocaleString('en-US', { maximumFractionDigits: 4 })
  }
  if (typeof value === 'object') {
    try { return cleanText(JSON.stringify(value)) } catch { return '' }
  }
  return cleanText(String(value))
}

export function safeFileName(name: string): string {
  return (name.replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)) || 'export'
}
