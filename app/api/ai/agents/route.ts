import { NextResponse } from 'next/server'
import { auth } from '@/lib/ai-session'
import { withApi } from '@/lib/api-handler'
import { AuthenticationError } from '@/lib/errors'
import { listAgents } from '@/lib/ai/agents/registry'

export const GET = withApi(async () => {
  const session = await auth()
  if (!session) throw new AuthenticationError()
  return NextResponse.json({ data: listAgents().map((a) => ({ id: a.id, name: a.name, description: a.description, tools: a.allowedTools })) })
})
