import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createProgramSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(''),
  referrerReward: z.number().min(0),
  refereeReward: z.number().min(0),
  maxRewards: z.number().optional().default(0),
  minOrderAmount: z.number().optional().default(0),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  try {
    const programs = await prisma.referralProgram.findMany({
      include: { _count: { select: { referrals: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: programs })
  } catch (error) {
    console.error('Programs fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createProgramSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    )
  }

  try {
    const program = await prisma.referralProgram.create({
      data: parsed.data,
    })

    return NextResponse.json({ data: program }, { status: 201 })
  } catch (error) {
    console.error('Create program error:', error)
    return NextResponse.json({ error: 'Failed to create program' }, { status: 500 })
  }
}
