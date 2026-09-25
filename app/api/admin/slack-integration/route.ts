import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const configureSlackSchema = z.object({
  workspaceId: z.string(),
  workspaceName: z.string(),
  accessToken: z.string(),
  channels: z.array(z.string()).optional(),
  notifyTypes: z.array(z.string()).optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  try {
    const integrations = await prisma.slackIntegration.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ data: integrations })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Slack integrations' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = configureSlackSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const slackIntegration = await prisma.slackIntegration.create({
      data: {
        workspaceId: parsed.data.workspaceId,
        workspaceName: parsed.data.workspaceName,
        accessToken: parsed.data.accessToken,
        channels: JSON.stringify(parsed.data.channels || []),
        notifyTypes: JSON.stringify(parsed.data.notifyTypes || ['order', 'message', 'alert']),
        active: true,
      },
    })

    return NextResponse.json({ data: slackIntegration }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to configure Slack integration' }, { status: 500 })
  }
}
