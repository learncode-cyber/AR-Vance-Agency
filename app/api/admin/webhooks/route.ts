import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createWebhookSchema = z.object({
  integrationId: z.string(),
  url: z.string().url(),
  event: z.string(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const integrationId = url.searchParams.get('integrationId')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: any = {}
  if (integrationId) where.integrationId = integrationId

  try {
    const [webhooks, total] = await Promise.all([
      prisma.webhook.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.webhook.count({ where }),
    ])

    return NextResponse.json({
      data: webhooks,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createWebhookSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const secret = Math.random().toString(36).substring(2, 15)

    const webhook = await prisma.webhook.create({
      data: {
        ...parsed.data,
        secret,
      },
    })

    return NextResponse.json({ data: webhook }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 })
  }
}
