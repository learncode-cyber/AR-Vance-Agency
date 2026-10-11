import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'

// Real `Testimonial` columns: name, role, initials, image, rating, text,
// order, active. The admin UI uses clientName/clientPosition/clientCompany/
// content/featured/published, so those are accepted and mapped, and returned
// in the same shape on read.
const createTestimonialSchema = z.object({
  content: z.string().min(10).max(2000),
  clientName: z.string().min(1).max(120),
  clientPosition: z.string().max(120).optional(),
  clientCompany: z.string().max(120).optional(),
  image: z.string().max(500).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  featured: z.boolean().optional(),
})

function initialsOf(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('') || '?'
}

function toUi(t: { id: string; name: string; role: string; image: string; rating: number; text: string; order: number; active: boolean; initials: string }) {
  const [position, ...rest] = t.role.split(' @ ')
  return {
    id: t.id,
    content: t.text,
    clientName: t.name,
    clientPosition: position || '',
    clientCompany: rest.join(' @ '),
    image: t.image,
    rating: t.rating,
    order: t.order,
    published: t.active,
    active: t.active,
    // The Testimonial model has no `featured` column; every active
    // testimonial is shown, so treat the first three as featured in the UI.
    featured: t.order < 3,
  }
}

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const sp = new URL(req.url).searchParams
  const where: { active?: boolean } = {}
  if (sp.get('published') === 'true') where.active = true

  try {
    const rows = await prisma.testimonial.findMany({ where, orderBy: { order: 'asc' } })
    return NextResponse.json({ data: rows.map(toUi) })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  if (!(await hasPermission(session.userId, 'manage_content'))) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = createTestimonialSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
  }
  const d = parsed.data

  try {
    const count = await prisma.testimonial.count()
    const testimonial = await prisma.testimonial.create({
      data: {
        name: d.clientName,
        role: [d.clientPosition, d.clientCompany].filter(Boolean).join(' @ ') || 'Client',
        initials: initialsOf(d.clientName),
        text: d.content,
        rating: d.rating ?? 5,
        order: count,
        ...(d.image ? { image: d.image } : {}),
      },
    })

    await logActivity(session.userId, 'testimonial_created', 'testimonial', testimonial.id, testimonial.name)
    return NextResponse.json({ data: toUi(testimonial) }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 })
  }
}
