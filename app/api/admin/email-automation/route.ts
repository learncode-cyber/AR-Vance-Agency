import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createEmailAutomationSchema = z.object({
  name: z.string(),
  subject: z.string(),
  htmlContent: z.string(),
  triggerType: z.string(),
  delaySeconds: z.number().optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  try {
    const [automations, total] = await Promise.all([
      prisma.emailAutomation.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.emailAutomation.count(),
    ])

    return NextResponse.json({
      data: automations,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch email automations' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createEmailAutomationSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const automation = await prisma.emailAutomation.create({
      data: {
        ...parsed.data,
        textContent: parsed.data.htmlContent,
        delaySeconds: parsed.data.delaySeconds || 0,
      },
    })

    return NextResponse.json({ data: automation }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create email automation' }, { status: 500 })
  }
}
