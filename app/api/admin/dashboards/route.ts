import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createDashboardSchema = z.object({
  name: z.string().min(3),
  type: z.string(),
  layout: z.record(z.any()).optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const type = url.searchParams.get('type')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: any = {}
  if (type) where.type = type

  try {
    const [dashboards, total] = await Promise.all([
      prisma.dashboard.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.dashboard.count({ where }),
    ])

    return NextResponse.json({
      data: dashboards,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboards' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createDashboardSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const slug = parsed.data.name.toLowerCase().replace(/\s+/g, '-')

    const dashboard = await prisma.dashboard.create({
      data: {
        ...parsed.data,
        slug,
        layout: JSON.stringify(parsed.data.layout || {}),
      },
    })

    return NextResponse.json({ data: dashboard }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create dashboard' }, { status: 500 })
  }
}
