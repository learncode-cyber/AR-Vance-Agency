export interface VectorRecord {
  id: string               // unique per chunk, e.g. `${documentId}:${chunkIndex}`
  documentId: string
  chunkIndex: number
  text: string
  vector: number[]
  namespace: string        // tenant/org isolation
}

export interface VectorMatch { id: string; documentId: string; chunkIndex: number; text: string; score: number; vector?: number[] }

/** Provider-independent vector storage. Swap MySQL for Pinecone/Qdrant/pgvector by implementing this. */
export interface VectorStore {
  readonly name: string
  upsert(records: VectorRecord[]): Promise<void>
  query(namespace: string, vector: number[], topK: number): Promise<VectorMatch[]>
  deleteByDocument(namespace: string, documentId: string): Promise<void>
}
