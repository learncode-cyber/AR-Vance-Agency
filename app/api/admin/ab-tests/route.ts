import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createABTestSchema = z.object({
  pageId: z.string(),
  name: z.string(),
  controlVariant: z.string(),
  metric: z.string(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const pageId = url.searchParams.get('pageId')
  const status = url.searchParams.get('status')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: any = {}
  if (pageId) where.pageId = pageId
  if (status) where.status = status

  try {
    const [tests, total] = await Promise.all([
      prisma.aBTest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.aBTest.count({ where }),
    ])

    return NextResponse.json({
      data: tests,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch A/B tests' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createABTestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const test = await prisma.aBTest.create({
      data: {
        ...parsed.data,
      },
    })

    return NextResponse.json({ data: test }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create A/B test' }, { status: 500 })
  }
}
