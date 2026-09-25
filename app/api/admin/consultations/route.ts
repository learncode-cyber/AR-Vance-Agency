import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const status = url.searchParams.get('status')
  const skip = (page - 1) * limit

  const where: any = {}
  if (status) where.status = status

  try {
    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.consultation.count({ where }),
    ])

    return NextResponse.json({
      data: consultations,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Consultations fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch consultations' }, { status: 500 })
  }
}
