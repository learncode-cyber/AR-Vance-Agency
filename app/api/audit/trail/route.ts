import { NextRequest, NextResponse } from 'next/server'
import { decisionAudit } from '@/services/evidence/DecisionAudit'
import { auth } from '@/lib/ai-session'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limit = req.nextUrl.searchParams.get('limit')
  const trail = await decisionAudit.getDecisionAuditTrail(
    session.user.organizationId,
    limit ? parseInt(limit) : 100
  )

  return NextResponse.json({ trail })
}
