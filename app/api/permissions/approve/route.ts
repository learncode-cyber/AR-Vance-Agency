import { NextRequest, NextResponse } from 'next/server'
import { authorizationService } from '@/services/permissions/AuthorizationService'
import { authForRoles as auth } from '@/lib/ai-session'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { requestId, approve, reason } = await req.json()
  
  if (approve) {
    const result = await authorizationService.approveRequest(requestId, session.user.id)
    return NextResponse.json({ ...result, status: 'approved' })
  } else {
    const result = await authorizationService.rejectRequest(requestId, session.user.id, reason)
    return NextResponse.json({ ...result, status: 'rejected' })
  }
}
