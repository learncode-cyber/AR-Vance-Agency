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

    const metrics = await prisma.marketingMetric.findMany({
      where: {
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    })

    // Calculate totals
    const totals = metrics.reduce(
      (acc, m) => ({
        emailsSent: acc.emailsSent + m.emailsSent,
        emailsOpened: acc.emailsOpened + m.emailsOpened,
        emailsClicked: acc.emailsClicked + m.emailsClicked,
        emailsBounced: acc.emailsBounced + m.emailsBounced,
        conversions: acc.conversions + m.conversions,
        conversionValue: acc.conversionValue + m.conversionValue,
        referralClicks: acc.referralClicks + m.referralClicks,
        referralConversions: acc.referralConversions + m.referralConversions,
        referralValue: acc.referralValue + m.referralValue,
      }),
      {
        emailsSent: 0,
        emailsOpened: 0,
        emailsClicked: 0,
        emailsBounced: 0,
        conversions: 0,
        conversionValue: 0,
        referralClicks: 0,
        referralConversions: 0,
        referralValue: 0,
      }
    )

    // Calculate rates
    const openRate = totals.emailsSent > 0 ? (totals.emailsOpened / totals.emailsSent) * 100 : 0
    const clickRate = totals.emailsOpened > 0 ? (totals.emailsClicked / totals.emailsOpened) * 100 : 0
    const bounceRate = totals.emailsSent > 0 ? (totals.emailsBounced / totals.emailsSent) * 100 : 0

    return NextResponse.json({
      data: {
        metrics,
        totals: {
          ...totals,
          openRate: openRate.toFixed(2),
          clickRate: clickRate.toFixed(2),
          bounceRate: bounceRate.toFixed(2),
        },
      },
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
