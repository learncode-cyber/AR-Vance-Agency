import { NextRequest, NextResponse } from 'next/server'
import { aiOrchestrator } from '@/services/ai/orchestrator/AIOrchestrator'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tasks } = await req.json()
  const result = await aiOrchestrator.createWorkflow(session.user.id, session.user.organizationId, tasks)

  return NextResponse.json(result)
}
