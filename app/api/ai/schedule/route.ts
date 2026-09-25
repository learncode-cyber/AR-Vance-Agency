import { NextRequest, NextResponse } from 'next/server'
import { taskScheduler } from '@/services/ai/TaskScheduler'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { agent, input, scheduleTime } = await req.json()
  const result = await taskScheduler.scheduleTask(
    session.user.id,
    session.user.organizationId,
    agent,
    input,
    new Date(scheduleTime)
  )

  return NextResponse.json(result)
}
