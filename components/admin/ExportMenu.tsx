'use client'
import { useState } from 'react'

const TYPES: Record<string, string> = {
  'lead-pipeline': 'Leads',
  orders: 'Orders',
  consultations: 'Consultations',
  'project-profitability': 'Project profitability',
  'client-revenue': 'Client revenue',
  'monthly-summary': 'Summary',
}
const FORMATS = [
  { key: 'xlsx', label: 'Excel' },
  { key: 'csv', label: 'CSV' },
  { key: 'pdf', label: 'PDF' },
  { key: 'docx', label: 'Word' },
]

const iso = (d: Date) => d.toISOString().slice(0, 10)

// Downloads a real PDF / Excel / CSV / Word file from /api/admin/reports/export.
export default function ExportMenu({ types }: { types: string[] }) {
  const [type, setType] = useState(types[0])
  const [from, setFrom] = useState(iso(new Date(Date.now() - 90 * 86_400_000)))
  const [to, setTo] = useState(iso(new Date()))

  function download(format: string) {
    const qs = new URLSearchParams({ type, dateFrom: from, dateTo: to, format })
    window.location.href = `/api/admin/reports/export?${qs.toString()}`
  }

  return (
    <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
      {types.length > 1 && (
        <select className="form-input" value={type} onChange={(e) => setType(e.target.value)} style={{ width: 'auto' }}>
          {types.map((t) => <option key={t} value={t}>{TYPES[t] ?? t}</option>)}
        </select>
      )}
      <input className="form-input" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} style={{ width: 'auto' }} aria-label="From date" />
      <input className="form-input" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} style={{ width: 'auto' }} aria-label="To date" />
      {FORMATS.map((f) => (
        <button key={f.key} type="button" className="admin-btn" onClick={() => download(f.key)} disabled={!from || !to || from > to}>
          ⬇ {f.label}
        </button>
      ))}
    </div>
  )
}
