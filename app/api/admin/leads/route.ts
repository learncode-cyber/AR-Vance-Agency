import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { parseCursor, parseLimit, toPage } from '@/lib/pagination'

const STAGES = ['new', 'qualifying', 'proposal_sent', 'won', 'lost'] as const
const stageSchema = z.enum(STAGES)

// Card-level fields only. message/notes/phone/email and attribution data
// (ip, userAgent, click ids) are fetched per lead via /api/admin/leads/:id.
const cardSelect = {
  id: true, name: true, company: true, subject: true, service: true,
  stage: true, source: true, valueEstimate: true, createdAt: true,
} as const

// GET /api/admin/leads?stage=new&limit=25&cursor=<id>
//  - cursor pagination, newest first (createdAt desc, id desc)
//  - `stage` optional; the Kanban board requests one column at a time
//  - first page (no cursor) also returns per-stage totals for column headers
export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const limit = parseLimit(url.searchParams.get('limit'))
  const cursor = parseCursor(url.searchParams.get('cursor'))
  const stageParam = url.searchParams.get('stage')
  const stage = stageParam ? stageSchema.safeParse(stageParam) : null
  if (stage && !stage.success) return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
  if (url.searchParams.get('cursor') && !cursor) return NextResponse.json({ error: 'Invalid cursor' }, { status: 400 })

  try {
    const [rows, groups] = await Promise.all([
      prisma.lead.findMany({
        where: stage?.success ? { stage: stage.data } : {},
        select: cardSelect,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      }),
      cursor ? Promise.resolve(null) : prisma.lead.groupBy({ by: ['stage'], _count: { _all: true } }),
    ])
    const { items, nextCursor } = toPage(rows, limit)
    return NextResponse.json({
      data: items,
      nextCursor,
      ...(groups ? { totals: Object.fromEntries(groups.map((g) => [g.stage, g._count._all])) } : {}),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}
