import { NextResponse } from 'next/server'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'
import { buildReport, reportRequestSchema } from '@/lib/reports'
import { exportResponse, isExportFormat } from '@/lib/export'

// Download a report as a real PDF / Excel (.xlsx) / CSV / Word (.docx) file.
//   GET /api/admin/reports/export?type=lead-pipeline&dateFrom=2026-01-01&dateTo=2026-03-31&format=xlsx
export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()
  if (!(await hasPermission(session.userId, 'view_analytics'))) return NextResponse.json({ error: 'Access Denied' }, { status: 403 })

  const sp = new URL(req.url).searchParams
  const format = sp.get('format') ?? 'pdf'
  if (!isExportFormat(format)) return NextResponse.json({ error: 'format must be pdf, xlsx, csv or docx' }, { status: 400 })
  const parsed = reportRequestSchema.safeParse({ type: sp.get('type'), dateFrom: sp.get('dateFrom'), dateTo: sp.get('dateTo') })
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 })

  try {
    const table = await buildReport(parsed.data)
    return await exportResponse(format, table, `${parsed.data.type}-${parsed.data.dateFrom}_${parsed.data.dateTo}`)
  } catch (error) {
    console.error('Report export error:', (error as Error).name)
    return NextResponse.json({ error: 'Failed to export report' }, { status: 500 })
  }
}
