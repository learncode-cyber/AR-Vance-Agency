import { NextRequest, NextResponse } from 'next/server'
import { decisionAudit } from '@/services/evidence/DecisionAudit'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId, type, decision, reasoning, approved, permissionLevel } = await req.json()

  const auditEntry = await decisionAudit.recordDecision(
    session.user.id,
    session.user.organizationId,
    taskId,
    decision,
    type,
    reasoning,
    approved,
    permissionLevel
  )

  return NextResponse.json(auditEntry)
}
