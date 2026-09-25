import { NextRequest, NextResponse } from 'next/server'
import { authorizationService } from '@/services/permissions/AuthorizationService'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action } = await req.json()
  
  const canPerform = await authorizationService.canPerformAction(session.user.id, action)
  const permLevel = await authorizationService.getUserPermissionLevel(session.user.id)

  return NextResponse.json({
    action,
    canPerform,
    permissionLevel: permLevel,
  })
}
