import { prisma } from '@/lib/prisma'
import { authorizationService } from './AuthorizationService'

export class ApprovalWorkflow {
  async requestApproval(
    decisionId: string,
    userId: string,
    organizationId: string,
    action: string,
    metadata: any
  ) {
    // Check if approval is needed
    const isActionApproved = await authorizationService.canPerformAction(userId, action)

    if (isActionApproved) {
      return { needsApproval: false, approved: true }
    }

    // Create approval request
    const request = await authorizationService.createApprovalRequest(
      decisionId,
      userId,
      `Approval needed for action: ${action}`,
      3 // L3 minimum for approval
    )

    return {
      needsApproval: true,
      requestId: request.id,
      status: 'pending'
    }
  }

  async executeIfApproved(requestId: string, action: () => Promise<any>) {
    const request = await prisma.aIApprovalRequest.findUnique({
      where: { id: requestId }
    })

    if (!request) throw new Error('Request not found')
    if (request.status !== 'approved') throw new Error('Request not approved')

    return action()
  }

  async getApprovalStatus(requestId: string) {
    return prisma.aIApprovalRequest.findUnique({
      where: { id: requestId }
    })
  }

  async getApprovalHistory(organizationId: string) {
    return prisma.aIApprovalRequest.findMany({
      where: {
        // Filter by org somehow
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })
  }
}

export const approvalWorkflow = new ApprovalWorkflow()
