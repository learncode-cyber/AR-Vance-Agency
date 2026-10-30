import { prisma } from '@/lib/prisma'
import { evidenceEngine } from './EvidenceEngine'

export class DecisionAudit {
  async recordDecision(
    userId: string,
    organizationId: string,
    taskId: string,
    decision: string,
    type: string, // proposal, send_email, publish, change_budget
    reasoning: string,
    approved: boolean,
    permissionLevel: number
  ) {
    const decisionId = `dec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Calculate confidence based on evidence
    const confidence = await evidenceEngine.calculateConfidenceScore(taskId)

    return prisma.aIDecision.create({
      data: {
        id: decisionId,
        userId,
        organizationId,
        taskId,
        type,
        decision,
        approved,
        permissionLevel,
        confidence,
        reasoning,
        createdAt: new Date(),
        approvedAt: approved ? new Date() : null,
      }
    })
  }

  async getDecisionAuditTrail(organizationId: string, limit: number = 100) {
    return prisma.aIDecision.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  async getDecisionsByStatus(organizationId: string, approved: boolean) {
    return prisma.aIDecision.findMany({
      where: { organizationId, approved },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getComplianceReport(organizationId: string) {
    const allDecisions = await prisma.aIDecision.findMany({
      where: { organizationId }
    })

    const approved = allDecisions.filter(d => d.approved).length
    const pending = allDecisions.filter(d => !d.approved).length
    const avgConfidence = allDecisions.length > 0
      ? allDecisions.reduce((sum, d) => sum + (d.confidence || 0.5), 0) / allDecisions.length
      : 0

    return {
      organizationId,
      totalDecisions: allDecisions.length,
      approved,
      pending,
      approvalRate: allDecisions.length > 0 ? (approved / allDecisions.length) * 100 : 0,
      averageConfidence: avgConfidence,
      decisionTypes: this.groupByType(allDecisions),
      generatedAt: new Date()
    }
  }

  private groupByType(decisions: any[]) {
    return decisions.reduce((acc, d) => {
      acc[d.type] = (acc[d.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

export const decisionAudit = new DecisionAudit()
