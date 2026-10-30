import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'
import { blocksSchema, slugify } from '@/lib/page-blocks'

// Editors (Editor / Sub Admin roles) read, edit, publish and delete custom pages.
const patchSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  slug: z.string().trim().min(2).max(120).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(400).optional(),
  ogImage: z.string().max(500).optional(),
  blocks: blocksSchema.optional(),
})

async function guard() {
  const session = await getAdminSession()
  if (!session) return { error: unauthorized() }
  if (!(await hasPermission(session.userId, 'manage_pages'))) return { error: NextResponse.json({ error: 'Access Denied' }, { status: 403 }) }
  return { session }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(); if (g.error) return g.error
  const { id } = await params
  const page = await prisma.page.findUnique({ where: { id } })
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  let blocks: unknown[] = []
  try { blocks = JSON.parse(page.blocks || '[]') } catch { blocks = [] }
  return NextResponse.json({ data: { ...page, blocks, publishedAt: page.publishedAt?.toISOString() ?? null } })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(); if (g.error) return g.error
  const { id } = await params
  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid data' }, { status: 400 })
  const d = parsed.data
  const current = await prisma.page.findUnique({ where: { id } })
  if (!current) return NextResponse.json({ error: 'Page not found' }, { status: 404 })

  const data: Record<string, unknown> = {}
  if (d.title !== undefined) data.title = d.title
  if (d.description !== undefined) data.description = d.description
  if (d.seoTitle !== undefined) data.seoTitle = d.seoTitle
  if (d.seoDescription !== undefined) data.seoDescription = d.seoDescription
  if (d.ogImage !== undefined) data.ogImage = d.ogImage
  if (d.blocks !== undefined) data.blocks = JSON.stringify(d.blocks)
  if (d.slug !== undefined) {
    const s = slugify(d.slug)
    if (!s) return NextResponse.json({ error: 'Slug must contain letters or numbers' }, { status: 400 })
    const clash = await prisma.page.findFirst({ where: { slug: s, NOT: { id } }, select: { id: true } })
    if (clash) return NextResponse.json({ error: 'Another page already uses this URL' }, { status: 409 })
    data.slug = s
  }
  if (d.status !== undefined) {
    data.status = d.status
    if (d.status === 'published' && current.status !== 'published') data.publishedAt = new Date()
  }
  const updated = await prisma.page.update({ where: { id }, data })
  await logActivity(g.session!.userId, 'page_updated', 'page', id, updated.title)
  return NextResponse.json({ data: { id: updated.id, slug: updated.slug, status: updated.status } })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(); if (g.error) return g.error
  const { id } = await params
  const page = await prisma.page.findUnique({ where: { id }, select: { title: true } })
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  await prisma.page.delete({ where: { id } })
  await logActivity(g.session!.userId, 'page_deleted', 'page', id, page.title)
  return NextResponse.json({ success: true })
}
