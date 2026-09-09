import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createProgramSchema = z.object({
  name: z.string().min(2),
  pointsPerDollar: z.number().min(0),
  pointsForSignup: z.number().optional().default(0),
  pointsForReview: z.number().optional().default(0),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  try {
    const programs = await prisma.loyaltyProgram.findMany({
      include: { _count: { select: { members: true } } },
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
    // Default tiers
    const tiers = [
      { name: 'Bronze', minPoints: 0, multiplier: 1 },
      { name: 'Silver', minPoints: 1000, multiplier: 1.1 },
      { name: 'Gold', minPoints: 5000, multiplier: 1.2 },
      { name: 'Platinum', minPoints: 10000, multiplier: 1.5 },
    ]

    const program = await prisma.loyaltyProgram.create({
      data: {
        ...parsed.data,
        tiers: JSON.stringify(tiers),
      },
    })

    return NextResponse.json({ data: program }, { status: 201 })
  } catch (error) {
    console.error('Create program error:', error)
    return NextResponse.json({ error: 'Failed to create program' }, { status: 500 })
  }
}
