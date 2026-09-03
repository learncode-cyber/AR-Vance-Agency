import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createKeySchema = z.object({
  key: z.string(),
  namespace: z.string(),
  defaultValue: z.string(),
  description: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const namespace = url.searchParams.get('namespace')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const skip = (page - 1) * limit

  const where: any = { active: true }
  if (namespace) where.namespace = namespace

  try {
    const [keys, total] = await Promise.all([
      prisma.translationKey.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.translationKey.count({ where }),
    ])

    return NextResponse.json({
      data: keys,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch translation keys' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createKeySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const key = await prisma.translationKey.create({
      data: {
        ...parsed.data,
        description: parsed.data.description || '',
      },
    })

    return NextResponse.json({ data: key }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create translation key' }, { status: 500 })
  }
}
