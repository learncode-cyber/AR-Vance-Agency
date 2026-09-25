import { NextRequest, NextResponse } from 'next/server'
import { approvalCenter } from '@/services/approval/ApprovalCenter'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dashboard = await approvalCenter.getDashboard(session.user.organizationId)
  const pending = await approvalCenter.getPendingApprovals(session.user.organizationId)

  return NextResponse.json({ dashboard, pending })
}
