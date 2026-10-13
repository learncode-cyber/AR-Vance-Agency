import { NextRequest, NextResponse } from 'next/server'
import { aiOrchestrator } from '@/services/ai/orchestrator/AIOrchestrator'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const { tasks } = await req.json()
  try {
    const result = await aiOrchestrator.createWorkflow(session.userId, tasks)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('FORBIDDEN')) {
      return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
    }
    console.error('Workflow creation failed:', err)
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 })
  }
}
