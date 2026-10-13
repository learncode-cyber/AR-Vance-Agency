import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'

// The admin UI sends { name, slug, description, basePrice } while the real
// `Service` model stores { title, shortDesc, longDesc, features(Json), active }.
// This route maps between the two so the UI keeps working and the DB gets
// valid columns (the old version wrote name/description/basePrice, which
// don't exist, and double-encoded `features` as a JSON string).
const createServiceSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers and hyphens'),
  description: z.string().min(1),
  longDescription: z.string().optional(),
  emoji: z.string().max(8).optional(),
  features: z.array(z.string().max(200)).max(50).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDesc: z.string().max(300).optional(),
})

function toUi(s: {
  id: string; slug: string; title: string; shortDesc: string; longDesc: string
  emoji: string; features: unknown; order: number; active: boolean
}) {
  return {
    id: s.id,
    slug: s.slug,
    name: s.title,
    description: s.shortDesc,
    longDescription: s.longDesc,
    emoji: s.emoji,
    features: s.features,
    order: s.order,
    published: s.active,
    active: s.active,
  }
}

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const published = new URL(req.url).searchParams.get('published')
  const where = published === 'true' ? { active: true } : {}

  try {
    const services = await prisma.service.findMany({ where, orderBy: { order: 'asc' } })
    return NextResponse.json({ data: services.map(toUi) })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  if (!(await hasPermission(session.userId, 'manage_content'))) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = createServiceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
  }
  const d = parsed.data

  try {
    const service = await prisma.service.create({
      data: {
        slug: d.slug,
        title: d.name,
        shortDesc: d.description,
        longDesc: d.longDescription ?? d.description,
        features: d.features ?? [],
        ...(d.emoji ? { emoji: d.emoji } : {}),
        ...(d.seoTitle ? { seoTitle: d.seoTitle } : {}),
        ...(d.seoDesc ? { seoDesc: d.seoDesc } : {}),
      },
    })

    await logActivity(session.userId, 'service_created', 'service', service.id, service.title)
    return NextResponse.json({ data: toUi(service) }, { status: 201 })
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') {
      return NextResponse.json({ error: 'A service with this slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
