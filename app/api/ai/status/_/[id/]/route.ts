import { NextRequest, NextResponse } from 'next/server'
import { aiTaskEngine } from '@/services/ai/AITaskEngine'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const task = await aiTaskEngine.getStatus(params.id)
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(task)
}
