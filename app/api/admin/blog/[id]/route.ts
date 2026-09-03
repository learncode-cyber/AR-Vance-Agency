import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const schema = z.object({
  title:      z.string().min(2).max(200).optional(),
  excerpt:    z.string().min(5).max(500).optional(),
  content:    z.string().min(10).optional(),
  category:   z.string().min(1).max(60).optional(),
  author:     z.string().min(1).max(100).optional(),
  authorRole: z.string().max(100).optional(),
  image:      z.string().max(500).optional(),
  readTime:   z.string().max(30).optional(),
  tags:       z.array(z.string()).optional(),
  seoTitle:   z.string().max(200).optional(),
  seoDesc:    z.string().max(300).optional(),
  featured:   z.boolean().optional(),
  active:     z.boolean().optional(),
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
    const updated = await prisma.blogPost.update({ where: { id }, data: parsed.data })
    return NextResponse.json({ data: updated })
  } catch {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const { id } = await params
  try {
    await prisma.blogPost.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }
}
