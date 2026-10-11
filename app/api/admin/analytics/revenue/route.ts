import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

/**
 * Revenue analytics — real numbers only.
 *
 * This route previously loaded EVERY client and project row into memory and
 * returned partly fabricated figures: hardcoded Jan–May monthly revenue, a
 * fixed 12.5% growth rate (commented "mock"), and costs guessed as 55% of
 * revenue. The schema has no Invoice/Payment/expense model and
 * Client.totalSpent is a running total with no dates, so month-by-month
 * revenue, growth, and costs genuinely cannot be computed today. Those
 * fields are returned as null (listed under `unavailable`) rather than
 * invented — add a real invoice/payment/expense model to enable them.
 */
export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const period = url.searchParams.get('period') || '6months'

  try {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const [clientTotals, projectsByStatus, topClients, recentProjects] = await Promise.all([
      prisma.client.aggregate({ _sum: { totalSpent: true } }),
      prisma.project.groupBy({
        by: ['status'],
        _count: { _all: true },
        _sum: { budget: true },
      }),
      prisma.client.findMany({
        orderBy: { totalSpent: 'desc' },
        take: 5,
        select: { id: true, name: true, totalSpent: true },
      }),
      // Bounded by date AND row count — used only for the per-month
      // "projects started" breakdown below.
      prisma.project.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true, budget: true },
        take: 5000,
      }),
    ])

    const totalRevenue = clientTotals._sum.totalSpent ?? 0
    const totalProjects = projectsByStatus.reduce((s, g) => s + g._count._all, 0)
    const totalProjectBudget = projectsByStatus.reduce((s, g) => s + (g._sum.budget ?? 0), 0)
    const completedProjects =
      projectsByStatus.find((g) => g.status === 'completed')?._count._all ?? 0
    const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0

    // Real, date-based data: projects started per month over the last 6 months.
    const buckets = new Map<string, { projectsStarted: number; budgetStarted: number }>()
    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo)
      d.setMonth(sixMonthsAgo.getMonth() + i)
      buckets.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, {
        projectsStarted: 0,
        budgetStarted: 0,
      })
    }
    for (const p of recentProjects) {
      const key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, '0')}`
      const b = buckets.get(key)
      if (b) {
        b.projectsStarted += 1
        b.budgetStarted += p.budget || 0
      }
    }
    const monthlyProjects = Array.from(buckets.entries()).map(([month, v]) => ({ month, ...v }))

    return NextResponse.json({
      data: {
        summary: {
          totalRevenue,
          totalProjectBudget,
          completedProjects,
          totalProjects,
          completionRate: completionRate.toFixed(1),
          // Not tracked in the schema — null instead of a made-up figure.
          totalCosts: null,
          netProfit: null,
          profitMargin: null,
          growthRate: null,
        },
        monthlyProjects,
        monthlyData: null,
        costBreakdown: null,
        topClients: topClients.map((c) => ({
          id: c.id,
          name: c.name,
          spent: c.totalSpent || 0,
        })),
        unavailable: ['totalCosts', 'netProfit', 'profitMargin', 'growthRate', 'monthlyData', 'costBreakdown'],
        unavailableReason:
          'No invoice, payment, or expense records exist in the database, so these cannot be calculated from real data.',
        period,
      },
    })
  } catch (error) {
    console.error('Revenue analytics error:', error)
    return NextResponse.json({ error: 'Failed to load revenue analytics' }, { status: 500 })
  }
}
