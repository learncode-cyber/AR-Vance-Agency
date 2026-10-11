import { cosine } from './similarity'
import type { VectorMatch, VectorRecord, VectorStore } from './types'

/** In-memory store: used in tests and as a zero-config dev fallback. */
export class MemoryVectorStore implements VectorStore {
  readonly name = 'memory'
  private rows = new Map<string, VectorRecord>()
  async upsert(records: VectorRecord[]) { for (const r of records) this.rows.set(`${r.namespace}|${r.id}`, r) }
  async query(namespace: string, vector: number[], topK: number): Promise<VectorMatch[]> {
    return [...this.rows.values()]
      .filter((r) => r.namespace === namespace)
      .map((r) => ({ id: r.id, documentId: r.documentId, chunkIndex: r.chunkIndex, text: r.text, vector: r.vector, score: cosine(vector, r.vector) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
  }
  async deleteByDocument(namespace: string, documentId: string) {
    for (const [k, r] of this.rows) if (r.namespace === namespace && r.documentId === documentId) this.rows.delete(k)
  }
}
