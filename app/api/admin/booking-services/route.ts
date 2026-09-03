import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

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

    return NextResponse.json({ data: services })
  } catch (error) {
    console.error('Services fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = serviceSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid data' },
      { status: 400 }
    )
  }

  try {
    const service = await prisma.consultationService.create({
      data: parsed.data,
    })

    return NextResponse.json({ data: service }, { status: 201 })
  } catch (error) {
    console.error('Create service error:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
