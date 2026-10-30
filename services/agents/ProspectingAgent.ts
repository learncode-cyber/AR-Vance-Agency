import { getProviderRegistry } from '@/lib/ai/AIProvider'

export class ProspectingAgent {
  async findProspects(criteria: any) {
    const registry = getProviderRegistry()
    const provider = registry.getProviderWithFallback('gemini')
    const prompt = `Find prospects: ${JSON.stringify(criteria)}\nReturn: companies, contacts, value`
    const response = await provider.generateText({ prompt, maxTokens: 800 })
    return { prospects: response.content, methodology: 'AI_SEARCH' }
  }

  async generateOutreach(prospect: any) {
    const registry = getProviderRegistry()
    const provider = registry.getProviderWithFallback('gemini')
    const prompt = `Generate outreach for: ${JSON.stringify(prospect)}`
    const response = await provider.generateText({ prompt, maxTokens: 600 })
    return response.content
  }
}

export const prospectingAgent = new ProspectingAgent()
