import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const updateSchema = z.object({
  name:                   z.string().min(2).max(200).optional(),
  slug:                   z.string().regex(/^[a-z0-9-]+$/).optional(),
  description:            z.string().optional(),
  clientId:               z.string().optional(),
  category:               z.string().max(100).optional(),
  budget:                 z.number().optional(),
  status:                 z.enum(['active', 'completed', 'on-hold', 'archived']).optional(),
  challenge:              z.string().optional(),
  solution:               z.string().optional(),
  outcome:                z.string().optional(),
  testimonial:            z.string().optional(),
  testimonialAuthor:      z.string().optional(),
  testimonialRole:        z.string().optional(),
  roi:                    z.number().optional(),
  clientSatisfaction:     z.number().optional(),
  completionRate:         z.number().optional(),
  technologies:           z.string().optional(),
  published:              z.boolean().optional(),
  featuredInPortfolio:    z.boolean().optional(),
  coverImage:             z.string().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid data' },
      { status: 400 }
    )
  }

  try {
    const updated = await prisma.project.update({
      where: { id },
      data: parsed.data,
      include: { client: { select: { name: true } } },
    })
    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Update project error:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const { id } = await params

  try {
    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }
}
