import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'

const createCampaignSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  listId: z.string(),
  subject: z.string().min(5),
  htmlContent: z.string().min(10),
  templateId: z.string().optional(),
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
    const [campaigns, total] = await Promise.all([
      prisma.emailCampaign.findMany({
        where,
        include: { list: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.emailCampaign.count({ where }),
    ])

    return NextResponse.json({
      data: campaigns,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
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
  const parsed = createCampaignSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const campaign = await prisma.emailCampaign.create({
      data: {
        ...parsed.data,
        status: 'draft',
      },
      include: { list: true },
    })

    await logActivity(session.userId, 'campaign_created', 'email', campaign.id, campaign.name)

    return NextResponse.json({ data: campaign }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}
