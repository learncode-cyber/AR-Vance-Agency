import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createGDPRRequestSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  type: z.enum(['access', 'deletion', 'portability', 'rectification']),
  description: z.string().optional(),
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
    const [requests, total] = await Promise.all([
      prisma.gDPRRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.gDPRRequest.count({ where }),
    ])

    return NextResponse.json({
      data: requests,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch GDPR requests' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createGDPRRequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + 30) // 30-day deadline per GDPR

    const request = await prisma.gDPRRequest.create({
      data: {
        ...parsed.data,
        deadline,
      },
    })

    return NextResponse.json({ data: request }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create GDPR request' }, { status: 500 })
  }
}
