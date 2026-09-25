import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createKPISchema = z.object({
  name: z.string().min(3),
  category: z.string(),
  targetValue: z.number(),
  unit: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const category = url.searchParams.get('category')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: any = {}
  if (category) where.category = category

  try {
    const [metrics, total] = await Promise.all([
      prisma.kPIMetric.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.kPIMetric.count({ where }),
    ])

    return NextResponse.json({
      data: metrics,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch KPI metrics' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createKPISchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const slug = parsed.data.name.toLowerCase().replace(/\s+/g, '-')

    const kpi = await prisma.kPIMetric.create({
      data: {
        ...parsed.data,
        slug,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
      },
    })

    return NextResponse.json({ data: kpi }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create KPI metric' }, { status: 500 })
  }
}
