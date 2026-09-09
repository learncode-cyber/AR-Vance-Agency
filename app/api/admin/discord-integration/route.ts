import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const configureDiscordSchema = z.object({
  serverId: z.string(),
  serverName: z.string(),
  botToken: z.string(),
  channels: z.array(z.string()).optional(),
  notifyTypes: z.array(z.string()).optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  try {
    const integrations = await prisma.discordIntegration.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ data: integrations })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Discord integrations' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = configureDiscordSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const discordIntegration = await prisma.discordIntegration.create({
      data: {
        serverId: parsed.data.serverId,
        serverName: parsed.data.serverName,
        botToken: parsed.data.botToken,
        channels: JSON.stringify(parsed.data.channels || []),
        notifyTypes: JSON.stringify(parsed.data.notifyTypes || ['order', 'message', 'alert']),
        active: true,
      },
    })

    return NextResponse.json({ data: discordIntegration }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to configure Discord integration' }, { status: 500 })
  }
}
