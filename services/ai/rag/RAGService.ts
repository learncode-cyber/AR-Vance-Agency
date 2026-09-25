import { prisma } from '@/lib/prisma'
import { embeddingsService } from '@/lib/ai/embeddings/EmbeddingsService'
import { getProviderRegistry } from '@/lib/ai/AIProvider'

export class RAGService {
  async indexDocument(docId: string) {
    const doc = await prisma.knowledgeDocument.findUnique({ where: { id: docId } })
    if (!doc) throw new Error('Document not found')

    // Generate embedding
    const embedding = await embeddingsService.generateEmbedding(doc.content)
    
    // Store embedding
    await prisma.knowledgeEmbedding.create({
      data: {
        documentId: docId,
        embedding: JSON.stringify(embedding),
        model: 'embedding-001',
        dimension: embedding.length,
      }
    })

    return { docId, indexed: true, embedding: embedding.length }
  }

  async searchSimilarDocuments(organizationId: string, query: string, limit: number = 5) {
    const queryEmbedding = await embeddingsService.generateEmbedding(query)

    // Get all documents for the org
    const docs = await prisma.knowledgeDocument.findMany({
      where: { organizationId },
      include: { embeddings: true }
    })

    // Calculate similarity scores
    const scored = docs
      .filter(doc => doc.embeddings.length > 0)
      .map(doc => {
        const storedEmbedding = JSON.parse(doc.embeddings[0].embedding)
        const score = embeddingsService.cosineSimilarity(queryEmbedding, storedEmbedding)
        return { doc, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return scored
  }

  async generateAnswerWithRAG(organizationId: string, question: string) {
    // Get relevant documents
    const relevant = await this.searchSimilarDocuments(organizationId, question, 5)
    const context = relevant.map(r => r.doc.content).join('\n\n')

    // Generate answer using AI
    const registry = getProviderRegistry()
    const provider = registry.getProviderWithFallback('gemini')

    const prompt = `Using this context:\n${context}\n\nAnswer this question:\n${question}`

    const response = await provider.generateText({
      prompt,
      maxTokens: 1000,
    })

    return {
      answer: response.content,
      sources: relevant.map(r => ({ id: r.doc.id, title: r.doc.title, score: r.score })),
      tokensUsed: response.tokensUsed,
    }
  }
}

export const ragService = new RAGService()
