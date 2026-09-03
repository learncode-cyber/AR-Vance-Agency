import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const schema = z.object({
  title:     z.string().min(2).max(150).optional(),
  emoji:     z.string().max(10).optional(),
  shortDesc: z.string().min(5).max(300).optional(),
  longDesc:  z.string().min(5).max(2000).optional(),
  features:  z.array(z.string()).optional(),
  seoTitle:  z.string().max(200).optional(),
  seoDesc:   z.string().max(300).optional(),
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
    const updated = await prisma.service.update({ where: { id }, data: parsed.data })
    return NextResponse.json({ data: updated })
  } catch {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const { id } = await params
  try {
    await prisma.service.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }
}
