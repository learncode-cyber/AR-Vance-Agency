import { NextRequest, NextResponse } from 'next/server'
import { evidenceEngine } from '@/services/evidence/EvidenceEngine'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const taskId = req.nextUrl.searchParams.get('taskId')
  if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 })

  const evidence = await evidenceEngine.getEvidenceForTask(taskId)
  const confidence = await evidenceEngine.calculateConfidenceScore(taskId)
  const weights = await evidenceEngine.getEvidenceWeights(taskId)

  return NextResponse.json({ evidence, confidence, weights })
}
