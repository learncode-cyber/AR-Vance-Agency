import { prisma } from '@/lib/prisma'
import { getPermissionConfig, PermissionLevel } from '@/lib/ai/permissions/PermissionLevels'

export class AuthorizationService {
  async createRole(
    organizationId: string,
    name: string,
    permissionLevel: PermissionLevel,
    description?: string
  ) {
    return prisma.aIRole.create({
      data: {
        organizationId,
        name,
        permissionLevel,
        description,
      }
    })
  }

  async assignRoleToUser(userId: string, roleId: string) {
    return prisma.aIUserRole.create({
      data: {
        userId,
        roleId,
        assignedAt: new Date(),
      }
    })
  }

  async getUserPermissionLevel(userId: string): Promise<PermissionLevel> {
    const userRole = await prisma.aIUserRole.findFirst({
      where: { userId },
      include: { role: true },
      orderBy: { role: { permissionLevel: 'desc' } },
    })

    return userRole?.role?.permissionLevel || PermissionLevel.L1
  }

  async canPerformAction(userId: string, action: string): Promise<boolean> {
    const permLevel = await this.getUserPermissionLevel(userId)
    const config = getPermissionConfig(permLevel)

    if (action === 'observe') return config.canObserve
    if (action === 'recommend') return config.canRecommend
    if (action === 'approve') return config.canApprove
    if (action === 'execute') return config.canExecute

    return config.requiresApprovalFor.includes(action) === false
  }

  async checkBudgetApproval(userId: string, amount: number): Promise<{ approved: boolean; reason?: string }> {
    const permLevel = await this.getUserPermissionLevel(userId)
    const config = getPermissionConfig(permLevel)

    if (amount > (config.dailyBudgetLimit || 0)) {
      return {
        approved: false,
        reason: `Exceeds daily budget limit of $${config.dailyBudgetLimit}`
      }
    }

    return { approved: true }
  }

  async getDailySpent(userId: string, organizationId: string): Promise<number> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const spent = await prisma.aIDecision.aggregate({
      where: {
        userId,
        organizationId,
        createdAt: { gte: today }
      },
      _sum: {
        confidence: true // Use confidence as proxy for impact/cost
      }
    })

    return spent._sum.confidence || 0
  }

  async createApprovalRequest(
    decisionId: string,
    requestedBy: string,
    reason: string,
    requiredLevel: PermissionLevel
  ) {
    return prisma.aIApprovalRequest.create({
      data: {
        decisionId,
        requestedBy,
        reason,
        requiredLevel,
        status: 'pending',
      }
    })
  }

  async approveRequest(requestId: string, approvedBy: string) {
    return prisma.aIApprovalRequest.update({
      where: { id: requestId },
      data: {
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
      }
    })
  }

  async rejectRequest(requestId: string, rejectedBy: string, reason: string) {
    return prisma.aIApprovalRequest.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        rejectedBy,
        rejectionReason: reason,
        rejectedAt: new Date(),
      }
    })
  }

  async getPendingApprovals(organizationId: string) {
    return prisma.aIApprovalRequest.findMany({
      where: {
        status: 'pending',
      },
      orderBy: { createdAt: 'asc' }
    })
  }
}

export const authorizationService = new AuthorizationService()
