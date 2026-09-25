import { NextRequest, NextResponse } from 'next/server'
import { decisionAudit } from '@/services/evidence/DecisionAudit'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const report = await decisionAudit.getComplianceReport(session.user.organizationId)
  return NextResponse.json(report)
}
