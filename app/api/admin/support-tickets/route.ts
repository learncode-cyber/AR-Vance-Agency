import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createTicketSchema = z.object({
  subject: z.string().min(5),
  description: z.string().min(10),
  customerEmail: z.string().email(),
  customerName: z.string().min(2),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  category: z.string().optional().default('general'),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const status = url.searchParams.get('status')
  const skip = (page - 1) * limit

  const where: any = {}
  if (status) {
    where.status = status
  }

  try {
    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.supportTicket.count({ where }),
    ])

    return NextResponse.json({
      data: tickets,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Tickets fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createTicketSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    )
  }

  try {
    const ticketNumber = `TKT-${Date.now()}`

    const ticket = await prisma.supportTicket.create({
      data: {
        ...parsed.data,
        ticketNumber,
      },
    })

    return NextResponse.json({ data: ticket }, { status: 201 })
  } catch (error) {
    console.error('Create ticket error:', error)
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}
