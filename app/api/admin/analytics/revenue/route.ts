import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const period = url.searchParams.get('period') || '6months'

  try {
    // Get all clients and projects for revenue calculation
    const [clients, projects] = await Promise.all([
      prisma.client.findMany({
        select: {
          id: true,
          name: true,
          totalSpent: true,
          budget: true,
          status: true,
        },
      }),
      prisma.project.findMany({
        select: {
          id: true,
          name: true,
          budget: true,
          roi: true,
          status: true,
          clientId: true,
          startDate: true,
          endDate: true,
        },
      }),
    ])

    // Calculate revenue metrics
    const totalRevenue = clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0)
    const totalProjectBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
    
    // Estimate costs (simplified - typically 50-60% of revenue)
    const estimatedCosts = totalRevenue * 0.55
    const netProfit = totalRevenue - estimatedCosts
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    // Calculate growth rate (mock - would be actual month-over-month)
    const growthRate = 12.5

    // Project completion rate
    const completedProjects = projects.filter((p) => p.status === 'completed').length
    const completionRate = projects.length > 0 ? (completedProjects / projects.length) * 100 : 0

    return NextResponse.json({
      data: {
        summary: {
          totalRevenue,
          totalCosts: estimatedCosts,
          netProfit,
          profitMargin: profitMargin.toFixed(1),
          growthRate: growthRate.toFixed(1),
          completedProjects,
          totalProjects: projects.length,
          completionRate: completionRate.toFixed(1),
        },
        monthlyData: [
          {
            month: 'Jan',
            revenue: 45000,
            cost: 25000,
            profit: 20000,
            projects: 5,
          },
          {
            month: 'Feb',
            revenue: 52000,
            cost: 28000,
            profit: 24000,
            projects: 6,
          },
          {
            month: 'Mar',
            revenue: 58000,
            cost: 31000,
            profit: 27000,
            projects: 7,
          },
          {
            month: 'Apr',
            revenue: 65000,
            cost: 35000,
            profit: 30000,
            projects: 8,
          },
          {
            month: 'May',
            revenue: 71000,
            cost: 38000,
            profit: 33000,
            projects: 9,
          },
          {
            month: 'Jun',
            revenue: totalRevenue,
            cost: estimatedCosts,
            profit: netProfit,
            projects: projects.length,
          },
        ],
        costBreakdown: {
          staffCosts: estimatedCosts * 0.4,
          infrastructure: estimatedCosts * 0.25,
          marketing: estimatedCosts * 0.2,
          other: estimatedCosts * 0.15,
        },
        topClients: clients
          .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
          .slice(0, 5)
          .map((c) => ({
            id: c.id,
            name: c.name,
            spent: c.totalSpent || 0,
          })),
        period,
      },
    })
  } catch (error) {
    console.error('Revenue analytics error:', error)
    return NextResponse.json({ error: 'Failed to load revenue analytics' }, { status: 500 })
  }
}
