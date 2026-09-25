import { getProviderRegistry } from '@/lib/ai/AIProvider'

export class ContentEngine {
  async generateContent(contentType: string, topic: string, style: string) {
    const registry = getProviderRegistry()
    const provider = registry.getProviderWithFallback('gemini')
    const prompt = `Generate ${contentType} about ${topic} in ${style} style`
    const response = await provider.generateText({ prompt, maxTokens: 2000 })
    return { content: response.content, type: contentType }
  }

  async generateBlogPost(topic: string, keywords: string[], length: string = 'medium') {
    const registry = getProviderRegistry()
    const provider = registry.getProviderWithFallback('gemini')
    const prompt = `Write ${length} blog post about ${topic}\nKeywords: ${keywords.join(', ')}`
    const response = await provider.generateText({ prompt, maxTokens: 3000 })
    return response.content
  }

  async generateSocialMedia(topic: string, platforms: string[]) {
    const registry = getProviderRegistry()
    const provider = registry.getProviderWithFallback('gemini')
    const prompt = `Social media for ${platforms.join(', ')} about ${topic}`
    const response = await provider.generateText({ prompt, maxTokens: 1500 })
    return response.content
  }
}

export const contentEngine = new ContentEngine()
