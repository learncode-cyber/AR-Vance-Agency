import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import crypto from 'crypto'

const createKeySchema = z.object({
  name: z.string().min(3),
  scopes: z.array(z.string()).optional(),
  rateLimit: z.number().optional(),
  expiresAt: z.string().datetime().optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const active = url.searchParams.get('active')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: any = {}
  if (active) where.active = active === 'true'

  try {
    const [keys, total] = await Promise.all([
      prisma.aPIKey.findMany({
        where,
        select: {
          id: true,
          name: true,
          key: true,
          lastUsedAt: true,
          callCount: true,
          active: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.aPIKey.count({ where }),
    ])

    return NextResponse.json({
      data: keys,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
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
    const key = 'pk_' + crypto.randomBytes(32).toString('hex')
    const secret = crypto.createHash('sha256').update(crypto.randomBytes(32)).digest('hex')
    const slug = parsed.data.name.toLowerCase().replace(/\s+/g, '-')

    const apiKey = await prisma.aPIKey.create({
      data: {
        name: parsed.data.name,
        slug,
        key,
        secret,
        scopes: JSON.stringify(parsed.data.scopes || []),
        rateLimit: parsed.data.rateLimit || 1000,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
      },
    })

    return NextResponse.json({ data: { ...apiKey, key, secret } }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
  }
}
