import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'
import { buildReport, reportRequestSchema } from '@/lib/reports'
import { exportResponse } from '@/lib/export'
import { MAX_EXPORT_ROWS } from '@/lib/export/types'

// Real PDF. The old version returned an HTML string labelled `application/pdf` (so the "PDF"
// could not be opened) and interpolated report fields into that HTML unescaped.
// Accepts either { type, dateFrom, dateTo } (built from the database) or the legacy
// { title, data: [...] } shape (rendered as a generic table).
const legacySchema = z.object({
  title: z.string().min(1).max(200),
  data: z.array(z.record(z.string(), z.unknown())).max(MAX_EXPORT_ROWS),
})

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()
  if (!(await hasPermission(session.userId, 'view_analytics'))) return NextResponse.json({ error: 'Access Denied' }, { status: 403 })

  const body = await req.json().catch(() => null)
  try {
    const byType = reportRequestSchema.safeParse(body)
    if (byType.success) {
      return await exportResponse('pdf', await buildReport(byType.data), `${byType.data.type}-${byType.data.dateFrom}_${byType.data.dateTo}`)
    }
    const legacy = legacySchema.safeParse(body)
    if (!legacy.success) return NextResponse.json({ error: 'Provide { type, dateFrom, dateTo } or { title, data }' }, { status: 400 })

    const keys = Array.from(new Set(legacy.data.data.flatMap((r) => Object.keys(r)))).slice(0, 12)
    return await exportResponse('pdf', { title: legacy.data.title, columns: keys.map((k) => ({ key: k, label: k })), rows: legacy.data.data }, legacy.data.title)
  } catch (error) {
    console.error('PDF export error:', (error as Error).name)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
