import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const schema = z.object({
  title:     z.string().min(2).max(200).optional(),
  emoji:     z.string().max(10).optional(),
  image:     z.string().max(500).optional(),
  category:  z.string().min(1).max(60).optional(),
  tags:      z.array(z.string()).optional(),
  result:    z.string().min(1).max(200).optional(),
  shortDesc: z.string().min(5).max(500).optional(),
  challenge: z.string().max(1000).optional(),
  solution:  z.string().max(1000).optional(),
  results:   z.array(z.string()).optional(),
  client:    z.string().max(150).optional(),
  order:     z.number().int().optional(),
  active:    z.boolean().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const { id } = await params
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
  }

  try {
    const updated = await prisma.portfolioItem.update({ where: { id }, data: parsed.data })
    return NextResponse.json({ data: updated })
  } catch {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const { id } = await params
  try {
    await prisma.portfolioItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }
}
