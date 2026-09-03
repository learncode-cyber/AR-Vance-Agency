import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const limit = parseInt(url.searchParams.get('limit') || '10')

  try {
    const insights = await prisma.aIInsight.findMany({
      orderBy: { generatedAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ data: insights })
  } catch (error) {
    console.error('Insights fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 })
  }
}
