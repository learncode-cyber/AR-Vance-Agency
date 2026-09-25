import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const email = url.searchParams.get('email')

  if (!email) {
    return NextResponse.json(
      { error: 'Email required' },
      { status: 400 }
    )
  }

  try {
    const member = await prisma.loyaltyMember.findFirst({
      where: { email },
      include: { program: true },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: member })
  } catch (error) {
    console.error('Member fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch member' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const { programId, email, name } = await req.json()

  if (!programId || !email || !name) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  try {
    const member = await prisma.loyaltyMember.create({
      data: {
        programId,
        email,
        name,
      },
      include: { program: true },
    })

    return NextResponse.json({ data: member }, { status: 201 })
  } catch (error) {
    console.error('Create member error:', error)
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    )
  }
}
