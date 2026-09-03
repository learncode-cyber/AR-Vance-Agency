import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const schema = z.object({
  name:     z.string().min(2).max(150).optional(),
  role:     z.string().min(2).max(150).optional(),
  initials: z.string().min(1).max(4).optional(),
  image:    z.string().max(500).optional(),
  rating:   z.number().int().min(1).max(5).optional(),
  text:     z.string().min(5).max(1000).optional(),
  order:    z.number().int().optional(),
  active:   z.boolean().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()
  const { id } = await params
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
  try {
    const updated = await prisma.testimonial.update({ where: { id }, data: parsed.data })
    return NextResponse.json({ data: updated })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()
  const { id } = await params
  try {
    await prisma.testimonial.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
