import { prisma } from '@/lib/prisma'
import { getProviderRegistry } from '@/lib/ai/AIProvider'

export class AITaskEngine {
  async createTask(userId: string, orgId: string, agent: string, input: string) {
    return prisma.aITask.create({
      data: { userId, organizationId: orgId, agent, input, status: 'queued', provider: 'gemini', model: 'gemini-1.5-pro' }
    })
  }

  async processTask(taskId: string) {
    const task = await prisma.aITask.findUnique({ where: { id: taskId } })
    if (!task) throw new Error('Task not found')
    
    try {
      await prisma.aITask.update({ where: { id: taskId }, data: { status: 'running' } })
      
      const registry = getProviderRegistry()
      const provider = registry.getProviderWithFallback('gemini')
      const response = await provider.generateText({ prompt: task.input, maxTokens: 2000 })
      
      await prisma.aITask.update({
        where: { id: taskId },
        data: { status: 'completed', result: response.content, inputTokens: response.tokensUsed.input, outputTokens: response.tokensUsed.output, completedAt: new Date() }
      })
    } catch (err) {
      await prisma.aITask.update({ where: { id: taskId }, data: { status: 'failed', error: String(err) } })
    }
  }

  async getStatus(taskId: string) {
    return prisma.aITask.findUnique({ where: { id: taskId } })
  }
}

export const aiTaskEngine = new AITaskEngine()
