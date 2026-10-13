import { getProviderRegistry } from '@/lib/ai/AIProvider'

export class SEOIntelligenceEngine {
  async analyzeSEO(url: string, keywords: string[]) {
    const registry = getProviderRegistry()
    const provider = registry.getProviderWithFallback('gemini')
    const prompt = `Analyze SEO for ${url} with keywords: ${keywords.join(', ')}\nProvide: score, opportunities`
    const response = await provider.generateText({ prompt, maxTokens: 800 })
    return { analysis: response.content, score: 75 }
  }

  async generateSEOStrategy(businessData: any) {
    const registry = getProviderRegistry()
    const provider = registry.getProviderWithFallback('gemini')
    const prompt = `SEO strategy for: ${JSON.stringify(businessData)}\nInclude: keywords, content plan`
    const response = await provider.generateText({ prompt, maxTokens: 1200 })
    return response.content
  }
}

export const seoIntelligenceEngine = new SEOIntelligenceEngine()
