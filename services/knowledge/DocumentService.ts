import { prisma } from '@/lib/prisma'

export class DocumentService {
  async storeDocument(
    organizationId: string,
    title: string,
    content: string,
    type: string,
    clientId?: string
  ) {
    const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const doc = await prisma.knowledgeDocument.create({
      data: {
        id: docId,
        organizationId,
        clientId,
        title,
        content,
        type, // proposal, case_study, internal_doc, email
        wordCount: content.split(/\s+/).length,
        indexedAt: new Date(),
      }
    })

    return doc
  }

  async searchDocuments(organizationId: string, query: string) {
    return prisma.knowledgeDocument.findMany({
      where: {
        organizationId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ]
      },
      take: 10,
    })
  }

  async getDocument(docId: string) {
    return prisma.knowledgeDocument.findUnique({ where: { id: docId } })
  }

  async deleteDocument(docId: string) {
    return prisma.knowledgeDocument.delete({ where: { id: docId } })
  }
}

export const documentService = new DocumentService()
