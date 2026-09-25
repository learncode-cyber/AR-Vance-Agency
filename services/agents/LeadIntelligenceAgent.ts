import { getProviderRegistry } from '@/lib/ai/AIProvider'

export class LeadIntelligenceAgent {
  async analyzeLead(leadData: any) {
    const registry = getProviderRegistry()
    const provider = registry.getProviderWithFallback('gemini')
    const prompt = `Analyze lead: ${JSON.stringify(leadData)}\nProvide: score, revenue, likelihood`
    const response = await provider.generateText({ prompt, maxTokens: 500 })
    return { analysis: response.content, confidence: 0.85 }
  }
}

export const leadIntelligenceAgent = new LeadIntelligenceAgent()
