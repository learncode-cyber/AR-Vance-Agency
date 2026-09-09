import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const schema = z.object({
  slug:             z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
  email:            z.string().email().optional(),
  name:             z.string().min(2).max(150).optional(),
  role:             z.string().min(2).max(150).optional(),
  bio:              z.string().max(5000).optional(),
  shortBio:         z.string().max(200).optional(),
  avatar:           z.string().max(500).optional(),
  coverImage:       z.string().max(500).optional(),
  emoji:            z.string().max(10).optional(),
  specialization:   z.string().max(150).optional(),
  experience:       z.string().max(100).optional(),
  skills:           z.array(z.string()).optional(),
  achievements:     z.string().optional(),
  linkedin:         z.string().max(300).optional(),
  twitter:          z.string().max(300).optional(),
  website:          z.string().max(300).optional(),
  phone:            z.string().max(20).optional(),
  seoTitle:         z.string().max(160).optional(),
  seoDesc:          z.string().max(160).optional(),
  userId:           z.string().optional().nullable(),
  order:            z.number().int().optional(),
  active:           z.boolean().optional(),
  featured:         z.boolean().optional(),
  canEditProfile:   z.boolean().optional(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const { id } = await params

  try {
    const member = await prisma.teamMember.findUniqueOrThrow({
      where: { id },
      include: { user: { select: { id: true, email: true, fullName: true, role: true } } },
    })
    return NextResponse.json({ data: member })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const { id } = await params
  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid data' },
      { status: 400 }
    )
  }

  try {
    // Check if slug/email already exists (excluding current member)
    if (parsed.data.slug || parsed.data.email) {
      const existing = await prisma.teamMember.findFirst({
        where: {
          AND: [
            { NOT: { id } },
            {
              OR: [
                parsed.data.slug ? { slug: parsed.data.slug } : undefined,
                parsed.data.email ? { email: parsed.data.email } : undefined,
              ].filter(Boolean) as any,
            },
          ],
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Email or slug already in use' },
          { status: 409 }
        )
      }
    }

    const updated = await prisma.teamMember.update({
      where: { id },
      data: parsed.data,
      include: { user: { select: { id: true, email: true, fullName: true, role: true } } },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Update team member error:', error)
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const { id } = await params

  try {
    await prisma.teamMember.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete team member error:', error)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
