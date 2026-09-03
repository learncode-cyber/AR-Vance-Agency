import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createBotSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(''),
  systemPrompt: z.string().min(10),
  aiModel: z.string().optional().default('claude-3-sonnet'),
  temperature: z.number().min(0).max(1).optional().default(0.7),
  maxTokens: z.number().min(100).optional().default(1000),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  try {
    const bots = await prisma.chatBot.findMany({
      include: {
        _count: {
          select: { conversations: true, responses: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: bots })
  } catch (error) {
    console.error('Bots fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch bots' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createBotSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    )
  }

  try {
    const bot = await prisma.chatBot.create({
      data: parsed.data,
    })

    return NextResponse.json({ data: bot }, { status: 201 })
  } catch (error) {
    console.error('Create bot error:', error)
    return NextResponse.json({ error: 'Failed to create bot' }, { status: 500 })
  }
}
