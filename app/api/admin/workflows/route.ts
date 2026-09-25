import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createWorkflowSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  category: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const category = url.searchParams.get('category')
  const enabled = url.searchParams.get('enabled')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: any = {}
  if (category) where.category = category
  if (enabled !== null) where.enabled = enabled === 'true'

  try {
    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where,
        include: { triggers_rel: true, actions_rel: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.workflow.count({ where }),
    ])

    return NextResponse.json({
      data: workflows,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createWorkflowSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const workflow = await prisma.workflow.create({
      data: {
        ...parsed.data,
        category: parsed.data.category || 'general',
      },
    })

    return NextResponse.json({ data: workflow }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 })
  }
}
