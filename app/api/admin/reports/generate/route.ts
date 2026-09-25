import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const { type, dateFrom, dateTo } = await req.json()

  const from = new Date(dateFrom)
  const to = new Date(dateTo)
  to.setHours(23, 59, 59, 999)

  try {
    let data: any = {}
    let title = ''

    switch (type) {
      case 'project-profitability':
        title = 'Project Profitability Report'
        const projects = await prisma.project.findMany({
          where: { createdAt: { gte: from, lte: to } },
          include: { client: true },
        })

        data = projects.map((p) => ({
          name: p.name,
          client: p.client.name,
          budget: p.budget,
          roi: p.roi,
          completionRate: p.completionRate,
          profit: (p.budget * (1 + p.roi / 100)) - p.budget,
        }))
        break

      case 'client-revenue':
        title = 'Client Revenue Analysis Report'
        const clients = await prisma.client.findMany({
          where: { createdAt: { gte: from, lte: to } },
          include: { projects: { where: { createdAt: { gte: from, lte: to } } } },
        })

        data = clients.map((c) => ({
          name: c.name,
          company: c.company,
          projectCount: c.projects.length,
          totalSpent: c.projects.reduce((sum, p) => sum + p.budget, 0),
          avgProjectValue:
            c.projects.length > 0
              ? Math.round(c.projects.reduce((sum, p) => sum + p.budget, 0) / c.projects.length)
              : 0,
        }))
        break

      case 'monthly-summary':
        title = 'Monthly Summary Report'
        const allProjects = await prisma.project.findMany({
          where: { createdAt: { gte: from, lte: to } },
        })

        const monthlyData: any = {}
        allProjects.forEach((p) => {
          const month = p.createdAt.toISOString().substring(0, 7)
          if (!monthlyData[month]) {
            monthlyData[month] = { revenue: 0, count: 0, completed: 0 }
          }
          monthlyData[month].revenue += p.budget
          monthlyData[month].count += 1
          if (p.status === 'completed') monthlyData[month].completed += 1
        })

        data = Object.entries(monthlyData).map(([month, stats]: any) => ({
          month,
          ...stats,
        }))
        break

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    return NextResponse.json({
      data: {
        type,
        title,
        description: `Report generated for ${from.toDateString()} to ${to.toDateString()}`,
        generatedAt: new Date().toISOString(),
        dateRange: `${from.toDateString()} to ${to.toDateString()}`,
        data,
      },
    })
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
