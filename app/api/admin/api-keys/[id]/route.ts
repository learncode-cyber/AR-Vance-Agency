import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const schema = z.object({ active: z.boolean() })

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const { id } = await params
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

  try {
    const updated = await prisma.apiKey.update({
      where: { id }, data: { active: parsed.data.active },
      select: { id: true, name: true, keyPrefix: true, scopes: true, active: true },
    })
    return NextResponse.json({ data: updated })
  } catch {
    return NextResponse.json({ error: 'Key not found' }, { status: 404 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const { id } = await params
  try {
    await prisma.apiKey.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Key not found' }, { status: 404 })
  }
}
