import { NextRequest, NextResponse } from 'next/server'
import { clientMemoryManager } from '@/services/memory/ClientMemoryManager'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { clientId, type, content, importance } = await req.json()

  let result
  if (type === 'interaction') {
    result = await clientMemoryManager.recordInteraction(clientId, content)
  } else if (type === 'insight') {
    result = await clientMemoryManager.recordInsight(clientId, content, importance)
  } else {
    return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
  }

  return NextResponse.json(result)
}
