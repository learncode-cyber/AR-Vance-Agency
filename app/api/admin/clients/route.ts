import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'

const createClientSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  email: z.string().email(),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  phone: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: any = {}
  if (status) where.status = status

  try {
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.client.count({ where }),
    ])

    return NextResponse.json({
      data: clients,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
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
  const parsed = createClientSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const client = await prisma.client.create({
      data: parsed.data,
    })

    await logActivity(session.userId, 'client_created', 'client', client.id, client.name)

    return NextResponse.json({ data: client }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}
