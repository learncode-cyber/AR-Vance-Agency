import { NextResponse } from 'next/server'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'
import { buildReport, reportRequestSchema } from '@/lib/reports'

// JSON report for on-screen display. (Previously: unvalidated dates -> "Invalid Date" 500s, and a
// server-timezone-dependent end-of-day.) Downloads use /api/admin/reports/export.
export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()
  if (!(await hasPermission(session.userId, 'view_analytics'))) return NextResponse.json({ error: 'Access Denied' }, { status: 403 })

  const parsed = reportRequestSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 })

  try {
    const table = await buildReport(parsed.data)
    return NextResponse.json({ type: parsed.data.type, title: table.title, columns: table.columns, data: table.rows, generatedAt: new Date().toISOString() })
  } catch (error) {
    console.error('Report generation error:', (error as Error).name)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
