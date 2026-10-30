import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()
  if (!(await hasPermission(session.userId, 'view_analytics'))) return NextResponse.json({ error: 'Access Denied' }, { status: 403 })

  const url = new URL(req.url)
  const period = url.searchParams.get('period') || 'global'  // global, monthly, weekly
  const limit = parseInt(url.searchParams.get('limit') || '100')

  try {
    let orderBy: any = { globalRank: 'asc' }
    
    if (period === 'monthly') {
      orderBy = { monthlyRank: 'asc' }
    } else if (period === 'weekly') {
      orderBy = { weeklyRank: 'asc' }
    }

    const leaderboard = await prisma.leaderboard.findMany({
      orderBy,
      take: limit,
    })

    // Get current user's rank
    const userRank = await prisma.leaderboard.findFirst({
      where: { userId: session.userId },
    })

    return NextResponse.json({
      data: leaderboard,
      userRank: userRank || null,
      period,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
