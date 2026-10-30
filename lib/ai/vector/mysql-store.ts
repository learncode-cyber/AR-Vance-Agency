import { prisma } from '@/lib/prisma'
import { cosine } from './similarity'
import type { VectorMatch, VectorRecord, VectorStore } from './types'

// Brute-force cosine over chunk rows stored in MySQL. Correct and dependency-free,
// but O(n): fine up to a few thousand chunks. Beyond that, implement VectorStore
// for a managed vector DB (Pinecone/Qdrant/etc.) and select it in ./index.ts.
const MAX_SCAN = 5000
const MODEL = 'text-embedding-004'

export const mysqlVectorStore: VectorStore = {
  name: 'mysql',
  async upsert(records: VectorRecord[]) {
    for (const r of records) {
      await prisma.knowledgeEmbedding.upsert({
        where: { documentId_chunkIndex: { documentId: r.documentId, chunkIndex: r.chunkIndex } },
        create: { documentId: r.documentId, chunkIndex: r.chunkIndex, chunkText: r.text, embedding: JSON.stringify(r.vector), model: MODEL, dimension: r.vector.length },
        update: { chunkText: r.text, embedding: JSON.stringify(r.vector), model: MODEL, dimension: r.vector.length },
      })
    }
  },
  async query(namespace: string, vector: number[], topK: number): Promise<VectorMatch[]> {
    const rows = await prisma.knowledgeEmbedding.findMany({
      where: { document: { organizationId: namespace }, dimension: vector.length, chunkText: { not: null } }, // legacy whole-document rows (no chunkText) need a re-index
      select: { documentId: true, chunkIndex: true, chunkText: true, embedding: true },
      take: MAX_SCAN,
    })
    return rows
      .map((r) => {
        const v = JSON.parse(r.embedding) as number[]
        return { id: `${r.documentId}:${r.chunkIndex}`, documentId: r.documentId, chunkIndex: r.chunkIndex, text: r.chunkText ?? '', vector: v, score: cosine(vector, v) }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
  },
  async deleteByDocument(_namespace: string, documentId: string) {
    await prisma.knowledgeEmbedding.deleteMany({ where: { documentId } })
  },
}
