import { NextRequest, NextResponse } from 'next/server'
import { authorizationService } from '@/services/permissions/AuthorizationService'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, permissionLevel, description } = await req.json()
  
  const role = await authorizationService.createRole(
    session.user.organizationId,
    name,
    permissionLevel,
    description
  )

  return NextResponse.json(role)
}
