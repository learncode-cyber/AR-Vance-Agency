import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const updateSchema = z.object({
  name:             z.string().min(2).max(150).optional(),
  email:            z.string().email().optional(),
  phone:            z.string().max(20).optional(),
  website:          z.string().max(300).optional(),
  logo:             z.string().max(500).optional(),
  company:          z.string().max(150).optional(),
  industry:         z.string().max(100).optional(),
  employeeCount:    z.string().max(50).optional(),
  address:          z.string().max(300).optional(),
  city:             z.string().max(100).optional(),
  country:          z.string().max(100).optional(),
  primaryContact:   z.string().max(150).optional(),
  contactEmail:     z.string().email().optional(),
  contactPhone:     z.string().max(20).optional(),
  budget:           z.number().optional(),
  busyPeriod:       z.string().max(100).optional(),
  businessNeeds:    z.string().optional(),
  status:           z.enum(['active', 'inactive', 'prospect']).optional(),
  priority:         z.enum(['low', 'medium', 'high', 'vip']).optional(),
  rating:           z.number().min(0).max(5).optional(),
  notes:            z.string().optional(),
  portalAccess:     z.boolean().optional(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const { id } = await params

  try {
    const client = await prisma.client.findUniqueOrThrow({
      where: { id },
      include: {
        projects: true,
        communications: { orderBy: { createdAt: 'desc' }, take: 20 },
        documents: true,
      },
    })
    return NextResponse.json({ data: client })
  } catch {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid data' },
      { status: 400 }
    )
  }

  // Check if email is being changed to existing email
  if (parsed.data.email) {
    const existing = await prisma.client.findFirst({
      where: {
        AND: [
          { NOT: { id } },
          { email: parsed.data.email },
        ],
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      )
    }
  }

  try {
    const updated = await prisma.client.update({
      where: { id },
      data: parsed.data,
      include: {
        projects: true,
        communications: { take: 5 },
      },
    })
    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Update client error:', error)
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const { id } = await params

  try {
    await prisma.client.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }
}
