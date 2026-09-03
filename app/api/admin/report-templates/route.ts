import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createTemplateSchema = z.object({
  name: z.string().min(3),
  category: z.string(),
  structure: z.record(z.any()).optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const category = url.searchParams.get('category')
  const featured = url.searchParams.get('featured')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: any = { active: true }
  if (category) where.category = category
  if (featured) where.featured = featured === 'true'

  try {
    const [templates, total] = await Promise.all([
      prisma.reportTemplate.findMany({
        where,
        orderBy: { useCount: 'desc' },
        skip,
        take: limit,
      }),
      prisma.reportTemplate.count({ where }),
    ])

    return NextResponse.json({
      data: templates,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createTemplateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const slug = parsed.data.name.toLowerCase().replace(/\s+/g, '-')

    const template = await prisma.reportTemplate.create({
      data: {
        ...parsed.data,
        slug,
        structure: JSON.stringify(parsed.data.structure || {}),
      },
    })

    return NextResponse.json({ data: template }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
