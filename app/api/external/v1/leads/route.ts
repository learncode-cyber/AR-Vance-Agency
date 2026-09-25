import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiScope } from '@/lib/external-api-auth'

/**
 * GET /api/external/v1/leads
 * Query params: ?stage=new&limit=50&cursor=<lead_id>
 * Auth: Authorization: Bearer <api_key> with the "leads:read" scope
 */
export async function GET(req: Request) {
  const auth = await requireApiScope(req, 'leads:read')
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(req.url)
  const stage  = searchParams.get('stage') ?? undefined
  const limit  = Math.min(Number(searchParams.get('limit') ?? 50), 200)
  const cursor = searchParams.get('cursor') ?? undefined

  const leads = await prisma.lead.findMany({
    where: stage ? { stage } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
  })

  return NextResponse.json({
    data: leads,
    meta: {
      count: leads.length,
      next_cursor: leads.length === limit ? leads[leads.length - 1]?.id : null,
      authenticated_as: auth.name,
    },
    errors: null,
  })
}
