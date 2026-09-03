import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const trackAnalyticsSchema = z.object({
  metric: z.string(),
  value: z.number(),
  period: z.string(),
  dimension1: z.string().optional(),
  dimension2: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const metric = url.searchParams.get('metric')
  const period = url.searchParams.get('period')
  const startDate = url.searchParams.get('startDate')
  const endDate = url.searchParams.get('endDate')
  const limit = parseInt(url.searchParams.get('limit') || '100')

  const where: any = {}
  if (metric) where.metric = metric
  if (period) where.period = period
  if (startDate) where.date = { gte: new Date(startDate) }
  if (endDate) where.date = { ...where.date, lte: new Date(endDate) }

  try {
    const analytics = await prisma.analytics.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
    })

    return NextResponse.json({ data: analytics })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = trackAnalyticsSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const analytics = await prisma.analytics.create({
      data: {
        ...parsed.data,
        date: new Date(),
      },
    })

    return NextResponse.json({ data: analytics }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to track analytics' }, { status: 500 })
  }
}
