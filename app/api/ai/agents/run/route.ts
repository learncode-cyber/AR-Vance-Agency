import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/ai-session'
import { withApi } from '@/lib/api-handler'
import { AuthenticationError, ValidationError } from '@/lib/errors'
import { runAgent } from '@/lib/ai/agents/runner'
import { enqueueJob, kickJobs } from '@/lib/jobs/queue'
import { registerAllJobHandlers } from '@/lib/jobs/handlers'
import { getAgent } from '@/lib/ai/agents/registry'
import { NotFoundError } from '@/lib/errors'

const schema = z.object({ agentId: z.string().min(1).max(60), input: z.string().min(1).max(4000), async: z.boolean().optional() })

// POST /api/ai/agents/run  { agentId, input }
// Requires a logged-in admin with manage_ai. The agent can only use its own
// allowlisted tools, and each tool further checks the caller's own permissions.
export const POST = withApi(async (req) => {
  const session = await auth()
  if (!session) throw new AuthenticationError()
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) throw new ValidationError(parsed.error.errors[0]?.message ?? 'Invalid request', parsed.error.issues)
  if (!getAgent(parsed.data.agentId)) throw new NotFoundError('Agent')
  if (parsed.data.async) {
    // Long-running: queue it and return immediately (poll /api/ai/agents/jobs/:id).
    registerAllJobHandlers()
    const job = await enqueueJob('ai.agent.run', { agentId: parsed.data.agentId, input: parsed.data.input }, { createdBy: session.user.id })
    kickJobs()
    return NextResponse.json({ data: { jobId: job.id, status: job.status } }, { status: 202 })
  }
  const result = await runAgent({ agentId: parsed.data.agentId, userId: session.user.id, input: parsed.data.input })
  return NextResponse.json({ data: result })
})
