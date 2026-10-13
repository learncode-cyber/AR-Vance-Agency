import { getProviderRegistry } from '@/lib/ai/AIProvider'

export class BusinessAuditAgent {
  async auditBusiness(businessData: any) {
    const registry = getProviderRegistry()
    const provider = registry.getProviderWithFallback('gemini')
    const prompt = `Audit business: ${JSON.stringify(businessData)}\nProvide: strengths, weaknesses, opportunities`
    const response = await provider.generateText({ prompt, maxTokens: 1000 })
    return { audit: response.content, timestamp: new Date() }
  }
}

export const businessAuditAgent = new BusinessAuditAgent()
