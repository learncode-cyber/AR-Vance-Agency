import { NextRequest, NextResponse } from 'next/server'
import { ragService } from '@/services/ai/rag/RAGService'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { query, limit = 5 } = await req.json()
  
  const results = await ragService.searchSimilarDocuments(
    session.user.organizationId,
    query,
    limit
  )

  return NextResponse.json({
    query,
    results: results.map(r => ({
      id: r.doc.id,
      title: r.doc.title,
      content: r.doc.content.substring(0, 500),
      similarity: r.score,
    }))
  })
}
