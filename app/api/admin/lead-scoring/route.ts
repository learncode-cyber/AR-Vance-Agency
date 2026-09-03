import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createRuleSchema = z.object({
  name: z.string(),
  triggerType: z.string(),
  scoreValue: z.number(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  try {
    const [rules, total] = await Promise.all([
      prisma.leadScoringRule.findMany({
        where: { active: true },
        orderBy: { scoreValue: 'desc' },
        skip,
        take: limit,
      }),
      prisma.leadScoringRule.count({ where: { active: true } }),
    ])

    return NextResponse.json({
      data: rules,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch scoring rules' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createRuleSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const rule = await prisma.leadScoringRule.create({
      data: {
        ...parsed.data,
      },
    })

    return NextResponse.json({ data: rule }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create scoring rule' }, { status: 500 })
  }
}
