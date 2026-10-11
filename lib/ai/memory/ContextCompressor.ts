import { getProviderRegistry } from '@/lib/ai/AIProvider'

export class ContextCompressor {
  async compressContext(context: string): Promise<string> {
    if (context.length < 500) return context // No compression needed

    const registry = getProviderRegistry()
    const provider = registry.getProviderWithFallback('gemini')

    const response = await provider.generateText({
      prompt: `Compress this context into key points (max 200 words):\n${context}`,
      maxTokens: 300
    })

    return response.content
  }

  async extractKeyPoints(context: string): Promise<string[]> {
    const registry = getProviderRegistry()
    const provider = registry.getProviderWithFallback('gemini')

    const response = await provider.generateText({
      prompt: `Extract 5 key points from this context (JSON array):\n${context}`,
      maxTokens: 200
    })

    try {
      const points = JSON.parse(response.content)
      return Array.isArray(points) ? points : []
    } catch {
      return []
    }
  }

  async summarizeInteractions(interactions: string[]): Promise<string> {
    const combined = interactions.join('\n\n')
    return this.compressContext(combined)
  }
}

export const contextCompressor = new ContextCompressor()
