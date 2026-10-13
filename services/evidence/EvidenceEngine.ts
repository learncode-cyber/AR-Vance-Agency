import { prisma } from '@/lib/prisma'

export interface DecisionEvidence {
  id: string
  taskId: string
  organizationId: string
  clientId?: string
  type: string // observed, estimated, inferred, unknown
  content: string
  confidence: number // 0-1
  source: string
  timestamp: Date
}

export class EvidenceEngine {
  async recordEvidence(
    taskId: string,
    organizationId: string,
    type: string,
    content: string,
    confidence: number,
    source: string,
    clientId?: string
  ) {
    const evidenceId = `ev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    return prisma.aIEvidence.create({
      data: {
        id: evidenceId,
        taskId,
        type,
        content,
        confidence,
        createdAt: new Date(),
      }
    })
  }

  async getEvidenceForTask(taskId: string) {
    return prisma.aIEvidence.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' }
    })
  }

  async calculateConfidenceScore(taskId: string): Promise<number> {
    const evidence = await this.getEvidenceForTask(taskId)
    
    if (evidence.length === 0) return 0.5

    const total = evidence.reduce((sum, e) => sum + e.confidence, 0)
    return total / evidence.length
  }

  async getEvidenceWeights(taskId: string) {
    const evidence = await this.getEvidenceForTask(taskId)
    
    const weights: Record<string, number> = {}
    evidence.forEach(e => {
      weights[e.type] = (weights[e.type] || 0) + e.confidence
    })

    return weights
  }
}

export const evidenceEngine = new EvidenceEngine()
