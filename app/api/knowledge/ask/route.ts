import { NextRequest, NextResponse } from 'next/server'
import { ragService } from '@/services/ai/rag/RAGService'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { question } = await req.json()
  
  const result = await ragService.generateAnswerWithRAG(
    session.user.organizationId,
    question
  )

  return NextResponse.json(result)
}
