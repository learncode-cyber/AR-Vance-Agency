import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiScope } from '@/lib/external-api-auth'

export async function GET(req: Request) {
  const auth = await requireApiScope(req, 'testimonials:read')
  if (auth instanceof NextResponse) return auth

  const items = await prisma.testimonial.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json({ data: items, meta: { count: items.length, authenticated_as: auth.name }, errors: null })
}
