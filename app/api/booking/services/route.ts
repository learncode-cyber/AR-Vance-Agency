import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const services = await prisma.consultationService.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ data: services })
  } catch (error) {
    console.error('Services fetch error:', error)
    return NextResponse.json({ error: 'Failed to load services' }, { status: 500 })
  }
}
