import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { logActivity } from '@/lib/rbac'

const createIntegrationSchema = z.object({
  name: z.string().min(3),
  type: z.string(),
  category: z.string(),
  config: z.record(z.any()).optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const type = url.searchParams.get('type')
  const active = url.searchParams.get('active')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: any = {}
  if (type) where.type = type
  if (active) where.active = active === 'true'

  try {
    const [integrations, total] = await Promise.all([
      prisma.integration.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.integration.count({ where }),
    ])

    return NextResponse.json({
      data: integrations,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createIntegrationSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const slug = parsed.data.name.toLowerCase().replace(/\s+/g, '-')

    const integration = await prisma.integration.create({
      data: {
        ...parsed.data,
        slug,
        config: JSON.stringify(parsed.data.config || {}),
      },
    })

    await logActivity(session.userId, 'integration_created', 'integrations', integration.id, parsed.data.name)

    return NextResponse.json({ data: integration }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create integration' }, { status: 500 })
  }
}
