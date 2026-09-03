import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createScheduleSchema = z.object({
  reportId: z.string(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  time: z.string(),
  recipients: z.array(z.string()),
  format: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const reportId = url.searchParams.get('reportId')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: any = {}
  if (reportId) where.reportId = reportId

  try {
    const [schedules, total] = await Promise.all([
      prisma.reportSchedule.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.reportSchedule.count({ where }),
    ])

    return NextResponse.json({
      data: schedules,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch report schedules' }, { status: 500 })
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
    const schedule = await prisma.reportSchedule.create({
      data: {
        ...parsed.data,
        recipients: JSON.stringify(parsed.data.recipients),
        format: parsed.data.format || 'pdf',
      },
    })

    return NextResponse.json({ data: schedule }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create report schedule' }, { status: 500 })
  }
}
