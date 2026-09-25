import { GoogleGenerativeAI } from '@google/generative-ai'

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export class EmbeddingsService {
  async generateEmbedding(text: string): Promise<number[]> {
    const model = client.getGenerativeModel({ model: 'embedding-001' })
    
    const result = await model.embedContent(text)
    const embedding = result.embedding.values
    
    return embedding
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(text => this.generateEmbedding(text)))
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
