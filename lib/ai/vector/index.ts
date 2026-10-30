import type { VectorStore } from './types'
export * from './types'

let store: VectorStore | null = null
/** VECTOR_STORE=mysql (default). Add new providers here without touching RAG code. */
export async function getVectorStore(): Promise<VectorStore> {
  if (store) return store
  const choice = (process.env.VECTOR_STORE || 'mysql').toLowerCase()
  if (choice === 'memory') store = new (await import('./memory-store')).MemoryVectorStore()
  else store = (await import('./mysql-store')).mysqlVectorStore
  return store
}
