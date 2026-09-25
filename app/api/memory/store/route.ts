import { NextRequest, NextResponse } from 'next/server'
import { clientMemoryService } from '@/services/memory/ClientMemoryService'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { clientId, type, key, value, importance, ttl } = await req.json()
  
  const memory = await clientMemoryService.storeMemory(
    clientId,
    type,
    key,
    value,
    importance,
    ttl
  )

  return NextResponse.json(memory)
}
