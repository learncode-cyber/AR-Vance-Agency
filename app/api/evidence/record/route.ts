import { NextRequest, NextResponse } from 'next/server'
import { evidenceEngine } from '@/services/evidence/EvidenceEngine'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId, type, content, confidence, source, clientId } = await req.json()

  const evidence = await evidenceEngine.recordEvidence(
    taskId,
    session.user.organizationId,
    type,
    content,
    confidence,
    source,
    clientId
  )

  return NextResponse.json(evidence)
}
