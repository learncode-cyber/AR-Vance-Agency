import { z } from 'zod'
import { registerJobHandler } from './queue'
import { runAgent } from '@/lib/ai/agents/runner'

const agentPayload = z.object({ agentId: z.string().min(1).max(60), input: z.string().min(1).max(4000) })

let registered = false
/** Idempotent; call from any entry point that enqueues or processes jobs. */
export function registerAllJobHandlers(): void {
  if (registered) return
  registered = true
  registerJobHandler('ai.agent.run', async (payload, ctx) => {
    const p = agentPayload.parse(payload)
    if (!ctx.createdBy) throw new Error('ai.agent.run requires a creating user')
    // Runs with the ORIGINAL user's permissions, so a queued job can never exceed what that user could do.
    return runAgent({ agentId: p.agentId, userId: ctx.createdBy, input: p.input })
  })
}
