import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const days = parseInt(url.searchParams.get('days') || '30')

  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get analytics data
    const analytics = await prisma.chatBotAnalytics.findMany({
      where: {
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    })

    // Get conversation stats
    const conversations = await prisma.chatConversation.findMany({
      where: {
        createdAt: { gte: startDate },
      },
    })

    // Get ticket stats
    const tickets = await prisma.supportTicket.findMany({
      where: {
        createdAt: { gte: startDate },
      },
    })

    // Calculate totals
    const totalConversations = conversations.length
    const resolvedConversations = conversations.filter((c) => c.resolved).length
    const totalMessages = await prisma.chatMessage.count({
      where: { createdAt: { gte: startDate } },
    })

    const ticketsOpen = tickets.filter((t) => t.status === 'open').length
    const ticketsResolved = tickets.filter((t) => t.status === 'closed').length

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
            total: tickets.length,
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
