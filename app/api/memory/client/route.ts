import { NextRequest, NextResponse } from 'next/server'
import { clientMemoryService } from '@/services/memory/ClientMemoryService'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clientId = req.nextUrl.searchParams.get('clientId')
  const type = req.nextUrl.searchParams.get('type')

  if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 })

  const context = await clientMemoryService.getClientContext(clientId, type || undefined)
  const summary = await clientMemoryService.getMemorySummary(clientId)

  return NextResponse.json({ context, summary })
}
