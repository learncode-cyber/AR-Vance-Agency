import { prisma } from '@/lib/prisma'

export class ApprovalCenter {
  async getDashboard(organizationId: string) {
    const pending = await prisma.aIApprovalRequest.count({ where: { status: 'pending' } })
    const approved = await prisma.aIApprovalRequest.count({ where: { status: 'approved' } })
    const rejected = await prisma.aIApprovalRequest.count({ where: { status: 'rejected' } })

    return {
      pending, approved, rejected,
      totalProcessed: approved + rejected,
      approvalRate: approved + rejected > 0 ? (approved / (approved + rejected)) * 100 : 0
    }
  }

  async getPendingApprovals(organizationId: string, limit: number = 50) {
    return prisma.aIApprovalRequest.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      take: limit
    })
  }
}

export const approvalCenter = new ApprovalCenter()
