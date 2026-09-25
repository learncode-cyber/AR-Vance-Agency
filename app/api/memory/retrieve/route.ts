import { NextRequest, NextResponse } from 'next/server'
import { clientMemoryService } from '@/services/memory/ClientMemoryService'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { clientId, key } = await req.json()
  
  const memory = await clientMemoryService.getMemory(clientId, key)
  return NextResponse.json(memory || { found: false })
}
