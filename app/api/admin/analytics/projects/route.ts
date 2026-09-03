import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const period = url.searchParams.get('period') || '6months'

  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        budget: true,
        roi: true,
        clientSatisfaction: true,
        status: true,
        startDate: true,
        endDate: true,
        client: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Aggregate analytics
    const completedProjects = projects.filter((p) => p.status === 'completed')
    const avgROI =
      completedProjects.length > 0
        ? completedProjects.reduce((sum, p) => sum + (p.roi || 0), 0) /
          completedProjects.length
        : 0

    const avgSatisfaction =
      completedProjects.length > 0
        ? completedProjects.reduce((sum, p) => sum + (p.clientSatisfaction || 0), 0) /
          completedProjects.length
        : 0

    const totalProjectValue = projects.reduce((sum, p) => sum + (p.budget || 0), 0)

    return NextResponse.json({
      data: {
        projects: projects.map((p) => ({
          ...p,
          profit: (p.budget || 0) * ((p.roi || 0) / 100),
        })),
        analytics: {
          totalProjects: projects.length,
          completedProjects: completedProjects.length,
          avgROI: avgROI.toFixed(0),
          avgSatisfaction: avgSatisfaction.toFixed(1),
          totalProjectValue,
          onTimeDeliveryRate: 96.4, // Placeholder
        },
        period,
      },
    })
  } catch (error) {
    console.error('Project analytics error:', error)
    return NextResponse.json({ error: 'Failed to load project analytics' }, { status: 500 })
  }
}
