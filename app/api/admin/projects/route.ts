import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'

// Real `Project` requires clientId (relation) and category, and has no
// `clientName`. Old schema sent clientName, so every create failed.
const createProjectSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers and hyphens'),
  description: z.string().default(''),
  clientId: z.string().min(1, 'clientId is required'),
  category: z.string().min(1).max(80).default('general'),
  status: z.enum(['planning', 'active', 'in_progress', 'completed', 'on_hold']).default('active'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().min(0).optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const published = url.searchParams.get('published')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: any = {}
  if (status) where.status = status
  if (published === 'true') where.published = true  // Project.published exists

  try {
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { startDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
    ])

    return NextResponse.json({
      data: projects,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const hasAccess = await hasPermission(session.userId, 'manage_content')
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createProjectSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const project = await prisma.project.create({
      data: {
        ...parsed.data,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      },
    })

    await logActivity(session.userId, 'project_created', 'project', project.id, project.name)

    return NextResponse.json({ data: project }, { status: 201 })
  } catch (error) {
    const code = (error as { code?: string })?.code
    if (code === 'P2002') return NextResponse.json({ error: 'A project with this slug already exists' }, { status: 409 })
    if (code === 'P2003') return NextResponse.json({ error: 'Client not found' }, { status: 400 })
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
