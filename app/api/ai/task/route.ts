import { NextRequest, NextResponse } from 'next/server'
import { aiTaskEngine } from '@/services/ai/AITaskEngine'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { agent, input } = await req.json()
  const task = await aiTaskEngine.createTask(session.user.id, session.user.organizationId, agent, input)
  
  return NextResponse.json(task)
}
