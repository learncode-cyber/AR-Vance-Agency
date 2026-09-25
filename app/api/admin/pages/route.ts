import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createPageSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.string().optional(),
  templateId: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const category = url.searchParams.get('category')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: any = {}
  if (status) where.status = status
  if (category) where.category = category

  try {
    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.page.count({ where }),
    ])

    return NextResponse.json({
      data: pages,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createPageSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const slug = parsed.data.title.toLowerCase().replace(/\s+/g, '-')

    const page = await prisma.page.create({
      data: {
        ...parsed.data,
        slug,
        category: parsed.data.category || 'general',
      },
    })

    return NextResponse.json({ data: page }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 })
  }
}
