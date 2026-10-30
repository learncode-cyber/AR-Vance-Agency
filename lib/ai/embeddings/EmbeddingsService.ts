import { GoogleGenAI } from '@google/genai'

let _client: GoogleGenAI | null = null
function getClient(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set')
  return (_client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }))
}
// 'embedding-001' doesn't exist in the current SDK/API. 'text-embedding-004'
// is the real, current model name (confirmed from the installed
// @google/genai package's own bundled usage example).
export const EMBEDDING_MODEL = 'text-embedding-004'

export class EmbeddingsService {
  async generateEmbedding(text: string): Promise<number[]> {
    const result = await getClient().models.embedContent({
      model: EMBEDDING_MODEL,
      contents: [text],
    })

    const embedding = result.embeddings?.[0]?.values
    if (!embedding) {
      throw new Error('Gemini returned no embedding values')
    }
    return embedding
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    // The new SDK accepts a batch of contents in a single call, which is
    // both simpler and cheaper than the old Promise.all-of-single-calls
    // approach (one request instead of N).
    const result = await getClient().models.embedContent({
      model: EMBEDDING_MODEL,
      contents: texts,
    })
    const embeddings = result.embeddings
    if (!embeddings || embeddings.length !== texts.length) {
      throw new Error('Gemini returned an unexpected number of embeddings')
    }
    return embeddings.map((e) => {
      if (!e.values) throw new Error('Gemini returned an embedding with no values')
      return e.values
    })
  }

  cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }
}

export const embeddingsService = new EmbeddingsService()
