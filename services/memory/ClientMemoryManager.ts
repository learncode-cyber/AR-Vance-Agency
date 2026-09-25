import { clientMemoryService } from './ClientMemoryService'
import { contextCompressor } from '@/lib/ai/memory/ContextCompressor'

export class ClientMemoryManager {
  async recordInteraction(clientId: string, interaction: string) {
    const timestamp = new Date().toISOString()
    
    return clientMemoryService.storeMemory(
      clientId,
      'interaction',
      `interaction-${timestamp}`,
      interaction,
      0.7 // High importance for interactions
    )
  }

  async recordInsight(clientId: string, insight: string, importance: number = 0.8) {
    return clientMemoryService.storeMemory(
      clientId,
      'insight',
      `insight-${Date.now()}`,
      insight,
      importance
    )
  }

  async recordPreference(clientId: string, preference: string, value: string) {
    return clientMemoryService.storeMemory(
      clientId,
      'preference',
      preference,
      value,
      0.9, // High importance for preferences
      86400 * 365 // 1 year TTL
    )
  }

  async buildClientContext(clientId: string) {
    const memories = await clientMemoryService.getClientContext(clientId)
    
    const context = memories
      .map(m => `${m.type}(${m.importance.toFixed(2)}): ${m.value}`)
      .join('\n')

    // Compress if too long
    if (context.length > 5000) {
      return contextCompressor.compressContext(context)
    }

    return context
  }

  async cleanupExpiredMemories(clientId: string) {
    await clientMemoryService.deleteExpiredMemories()
    return { clientId, cleaned: true }
  }

  async getClientProfile(clientId: string) {
    const summary = await clientMemoryService.getMemorySummary(clientId)
    const preferences = await clientMemoryService.getClientContext(clientId, 'preference')
    const insights = await clientMemoryService.getClientContext(clientId, 'insight')

    return {
      clientId,
      summary,
      preferences: preferences.map(p => ({ key: p.key, value: p.value })),
      insights: insights.map(i => i.value),
      generatedAt: new Date()
    }
  }
}

export const clientMemoryManager = new ClientMemoryManager()
