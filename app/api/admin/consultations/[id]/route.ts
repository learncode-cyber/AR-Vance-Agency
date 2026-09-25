import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const updateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
  feedback: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  followUpRequired: z.boolean().optional(),
  reminderSent: z.boolean().optional(),
})

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  try {
    const consultation = await prisma.consultation.findUniqueOrThrow({
      where: { id: params.id },
    })

    return NextResponse.json({ data: consultation })
  } catch (error) {
    console.error('Consultation fetch error:', error)
    return NextResponse.json({ error: 'Consultation not found' }, { status: 404 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid data' },
      { status: 400 }
    )
  }

  try {
    const consultation = await prisma.consultation.update({
      where: { id: params.id },
      data: parsed.data,
    })

    return NextResponse.json({ data: consultation })
  } catch (error) {
    console.error('Update consultation error:', error)
    return NextResponse.json({ error: 'Failed to update consultation' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  try {
    await prisma.consultation.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Consultation deleted' })
  } catch (error) {
    console.error('Delete consultation error:', error)
    return NextResponse.json({ error: 'Failed to delete consultation' }, { status: 500 })
  }
}
