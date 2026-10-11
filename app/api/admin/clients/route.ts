import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'

// Real `Client` model has `company` (required) and no `slug`. The old schema
// sent `companyName` + `slug`, which Prisma rejects. `companyName` is still
// accepted from callers and mapped to `company`.
const createClientSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email(),
  company: z.string().min(1).max(200).optional(),
  companyName: z.string().min(1).max(200).optional(),
  industry: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
  website: z.string().max(300).optional(),
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
    const { companyName, company, ...rest } = parsed.data
    const client = await prisma.client.create({
      data: { ...rest, company: company ?? companyName ?? parsed.data.name },
    })

    await logActivity(session.userId, 'client_created', 'client', client.id, client.name)

    return NextResponse.json({ data: client }, { status: 201 })
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') {
      return NextResponse.json({ error: 'A client with this email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}
