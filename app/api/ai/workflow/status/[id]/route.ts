import { NextRequest, NextResponse } from 'next/server'
import { aiOrchestrator } from '@/services/ai/orchestrator/AIOrchestrator'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const tasks = await aiOrchestrator.getWorkflowStatus(params.id)
  return NextResponse.json({ workflowId: params.id, tasks })
}
