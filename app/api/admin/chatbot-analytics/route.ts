import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  // Validate/clamp: non-numeric input used to produce an Invalid Date.
  const parsedDays = parseInt(url.searchParams.get('days') || '30', 10)
  const days = Number.isFinite(parsedDays) ? Math.min(Math.max(parsedDays, 1), 365) : 30

  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Daily analytics rows (bounded by the date window; one row per day).
    const analytics = await prisma.chatBotAnalytics.findMany({
      where: {
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
      take: 1000,
    })

    // These used to load every conversation and ticket row into memory just
    // to call .length/.filter on them. Counting in the database returns the
    // same numbers without transferring the rows.
    const inWindow = { gte: startDate }
    const [
      totalConversations,
      resolvedConversations,
      totalMessages,
      ticketsTotal,
      ticketsOpen,
      ticketsResolved,
    ] = await Promise.all([
      prisma.chatConversation.count({ where: { createdAt: inWindow } }),
      prisma.chatConversation.count({ where: { createdAt: inWindow, resolved: true } }),
      prisma.chatMessage.count({ where: { createdAt: inWindow } }),
      prisma.supportTicket.count({ where: { createdAt: inWindow } }),
      prisma.supportTicket.count({ where: { createdAt: inWindow, status: 'open' } }),
      prisma.supportTicket.count({ where: { createdAt: inWindow, status: 'closed' } }),
    ])

    return NextResponse.json({
      data: {
        analytics,
        summary: {
          totalConversations,
          resolvedConversations,
          totalMessages,
          averageMessagesPerConversation:
            totalConversations > 0 ? (totalMessages / totalConversations).toFixed(1) : 0,
          resolutionRate:
            totalConversations > 0
              ? ((resolvedConversations / totalConversations) * 100).toFixed(1)
              : 0,
          tickets: {
            total: ticketsTotal,
            open: ticketsOpen,
            resolved: ticketsResolved,
          },
        },
      },
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
