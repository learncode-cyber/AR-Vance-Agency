import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'

const serviceSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional().default(''),
  duration: z.number().min(15).max(480),
  price: z.number().min(0),
  icon: z.string().optional().default('📞'),
  color: z.string().optional().default('#3B82F6'),
  active: z.boolean().optional().default(true),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  try {
    const services = await prisma.consultationService.findMany({
      orderBy: { createdAt: 'asc' },
    })

    // Expose `duration` (minutes) for existing UI consumers.
    return NextResponse.json({ data: services.map((s) => ({ ...s, duration: s.durationMinutes })) })
  } catch (error) {
    console.error('Services fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()


  const hasAccess = await hasPermission(session.userId, 'manage_marketing')
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
  }
  const body = await req.json()
  const parsed = serviceSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid data' },
      { status: 400 }
    )
  }

  try {
    // Real model: durationMinutes (not duration), required unique slug,
    // isAvailable, no `color` column.
    const { duration, color: _color, ...rest } = parsed.data
    const baseSlug = rest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'service'
    const service = await prisma.consultationService.create({
      data: {
        ...rest,
        durationMinutes: duration,
        isAvailable: rest.active,
        slug: `${baseSlug}-${Date.now().toString(36)}`,
      },
    })

    return NextResponse.json({ data: { ...service, duration: service.durationMinutes } }, { status: 201 })
  } catch (error) {
    console.error('Create service error:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
