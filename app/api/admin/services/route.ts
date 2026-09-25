import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'

const createServiceSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string(),
  basePrice: z.number().optional(),
  features: z.array(z.string()).optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const published = url.searchParams.get('published')

  const where: any = {}
  if (published === 'true') where.published = true

  try {
    const services = await prisma.service.findMany({
      where,
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ data: services })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
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
  const parsed = createServiceSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const service = await prisma.service.create({
      data: {
        ...parsed.data,
        features: JSON.stringify(parsed.data.features || []),
      },
    })

    await logActivity(session.userId, 'service_created', 'service', service.id, service.name)

    return NextResponse.json({ data: service }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
