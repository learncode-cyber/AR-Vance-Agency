import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'

const createTestimonialSchema = z.object({
  content: z.string().min(10),
  clientName: z.string(),
  clientPosition: z.string().optional(),
  clientCompany: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  featured: z.boolean().optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const published = url.searchParams.get('published')
  const featured = url.searchParams.get('featured')

  const where: any = {}
  if (published === 'true') where.published = true
  if (featured === 'true') where.featured = true

  try {
    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ data: testimonials })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const hasAccess = await hasPermission(session.userId, 'manage_content')
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createTestimonialSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const testimonial = await prisma.testimonial.create({
      data: {
        ...parsed.data,
        rating: parsed.data.rating || 5,
      },
    })

    await logActivity(
      session.userId,
      'testimonial_created',
      'testimonial',
      testimonial.id,
      testimonial.clientName
    )

    return NextResponse.json({ data: testimonial }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 })
  }
}
