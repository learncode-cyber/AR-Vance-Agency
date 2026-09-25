import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createScheduleSchema = z.object({
  name: z.string(),
  action: z.string(),
  frequency: z.enum(['once', 'daily', 'weekly', 'monthly', 'custom']),
  cronExpression: z.string().optional(),
  nextRunAt: z.string(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  try {
    const [schedules, total] = await Promise.all([
      prisma.schedule.findMany({
        orderBy: { nextRunAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.schedule.count(),
    ])

    return NextResponse.json({
      data: schedules,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createScheduleSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const schedule = await prisma.schedule.create({
      data: {
        name: parsed.data.name,
        action: parsed.data.action,
        frequency: parsed.data.frequency,
        cronExpression: parsed.data.cronExpression || '',
        nextRunAt: new Date(parsed.data.nextRunAt),
      },
    })

    return NextResponse.json({ data: schedule }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 })
  }
}
