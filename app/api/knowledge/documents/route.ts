import { NextRequest, NextResponse } from 'next/server'
import { documentService } from '@/services/knowledge/DocumentService'
import { ragService } from '@/services/ai/rag/RAGService'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, content, type, clientId } = await req.json()
  
  const doc = await documentService.storeDocument(
    session.user.organizationId,
    title,
    content,
    type,
    clientId
  )

  await ragService.indexDocument(doc.id)
  return NextResponse.json({ ...doc, indexed: true })
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const docs = await documentService.searchDocuments(session.user.organizationId, '')
  return NextResponse.json({ documents: docs })
}
