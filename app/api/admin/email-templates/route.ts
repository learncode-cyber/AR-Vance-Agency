import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'

const createTemplateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  subject: z.string().min(5),
  htmlContent: z.string().min(10),
  templateType: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const templateType = url.searchParams.get('templateType')

  const where: any = { active: true }
  if (templateType) where.templateType = templateType

  try {
    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: templates })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
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
  const parsed = createTemplateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const template = await prisma.emailTemplate.create({
      data: {
        ...parsed.data,
        templateType: parsed.data.templateType || 'promotional',
      },
    })

    await logActivity(session.userId, 'template_created', 'email', template.id, template.name)

    return NextResponse.json({ data: template }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
