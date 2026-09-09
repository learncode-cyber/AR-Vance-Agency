import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createKPISchema = z.object({
  name: z.string().min(2),
  metricName: z.string().min(2),
  metricType: z.string(),
  targetValue: z.number().min(0),
  targetPeriod: z.enum(['month', 'quarter', 'year']),
  startDate: z.string(),
  endDate: z.string(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  try {
    const kpis = await prisma.kPITarget.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: kpis })
  } catch (error) {
    console.error('KPIs fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch KPIs' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createKPISchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    )
  }

  try {
    const kpi = await prisma.kPITarget.create({
      data: {
        ...parsed.data,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
      },
    })

    return NextResponse.json({ data: kpi }, { status: 201 })
  } catch (error) {
    console.error('Create KPI error:', error)
    return NextResponse.json({ error: 'Failed to create KPI' }, { status: 500 })
  }
}
