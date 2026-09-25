import { NextRequest, NextResponse } from 'next/server'
import { clientMemoryManager } from '@/services/memory/ClientMemoryManager'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clientId = req.nextUrl.searchParams.get('clientId')
  if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 })

  const profile = await clientMemoryManager.getClientProfile(clientId)
  return NextResponse.json(profile)
}
