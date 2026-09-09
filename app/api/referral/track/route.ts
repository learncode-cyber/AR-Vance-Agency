import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  const { referralCode } = await req.json()

  if (!referralCode) {
    return NextResponse.json(
      { error: 'Referral code required' },
      { status: 400 }
    )
  }

  try {
    const referral = await prisma.referral.findUniqueOrThrow({
      where: { referralCode },
      include: { program: true },
    })

    // Increment click count
    await prisma.referral.update({
      where: { id: referral.id },
      data: { clickCount: { increment: 1 } },
    })

    return NextResponse.json({
      data: {
        referralCode,
        discount: referral.program.refereeReward,
      },
    })
  } catch (error) {
    console.error('Referral tracking error:', error)
    return NextResponse.json(
      { error: 'Invalid referral code' },
      { status: 404 }
    )
  }
}
