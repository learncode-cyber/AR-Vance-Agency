import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiScope } from '@/lib/external-api-auth'

export async function GET(req: Request) {
  const auth = await requireApiScope(req, 'team:read')
  if (auth instanceof NextResponse) return auth

  const team = await prisma.teamMember.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json({ data: team, meta: { count: team.length, authenticated_as: auth.name }, errors: null })
}
