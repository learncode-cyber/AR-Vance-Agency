import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiScope } from '@/lib/external-api-auth'

export async function GET(req: Request) {
  const auth = await requireApiScope(req, 'services:read')
  if (auth instanceof NextResponse) return auth

  const services = await prisma.service.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json({ data: services, meta: { count: services.length, authenticated_as: auth.name }, errors: null })
}
