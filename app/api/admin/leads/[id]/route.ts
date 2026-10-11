import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'

const schema = z.object({
  stage:         z.enum(['new', 'qualifying', 'proposal_sent', 'won', 'lost']).optional(),
  phone:         z.string().max(50).optional(),
  company:       z.string().max(150).optional(),
  valueEstimate: z.number().nonnegative().nullable().optional(),
  notes:         z.string().max(3000).optional(),
})

const detailSelect = {
  id: true, name: true, email: true, phone: true, company: true, subject: true, service: true,
  message: true, notes: true, stage: true, source: true, valueEstimate: true, createdAt: true,
} as const

// Full detail for one lead (used when a card is opened). Attribution/IP fields stay server-side.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()
  const { id } = await params
  const lead = await prisma.lead.findUnique({ where: { id }, select: detailSelect })
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  return NextResponse.json({ data: lead })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()


  const hasAccess = await hasPermission(session.userId, 'manage_crm')
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
  }
  const { id } = await params
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
  }

  try {
    const updated = await prisma.lead.update({ where: { id }, data: parsed.data, select: detailSelect })
    return NextResponse.json({ data: updated })
  } catch {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const hasAccess = await hasPermission(session.userId, 'manage_crm')
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
  }
  const { id } = await params
  try {
    await prisma.lead.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }
}
