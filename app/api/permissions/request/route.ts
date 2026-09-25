import { NextRequest, NextResponse } from 'next/server'
import { approvalWorkflow } from '@/services/permissions/ApprovalWorkflow'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { decisionId, action, metadata } = await req.json()
  
  const result = await approvalWorkflow.requestApproval(
    decisionId,
    session.user.id,
    session.user.organizationId,
    action,
    metadata
  )

  return NextResponse.json(result)
}
