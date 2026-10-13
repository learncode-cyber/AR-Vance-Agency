import { NextRequest, NextResponse } from 'next/server'
import { aiOrchestrator } from '@/services/ai/orchestrator/AIOrchestrator'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const tasks = await aiOrchestrator.getWorkflowStatus(params.id)
  return NextResponse.json({ workflowId: params.id, tasks })
}
