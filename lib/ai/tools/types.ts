import type { z } from 'zod'

// A tool is the ONLY way an AI agent can touch application data. Each tool
// declares its input/output schema, the RBAC permission the *calling user*
// must hold, and a timeout. There is deliberately no generic "run SQL" or
// "run command" tool and none can be registered through this interface:
// handlers receive validated input and only call typed service/Prisma code.
export interface ToolDefinition<I = unknown, O = unknown> {
  name: string // e.g. "crm.search_leads"
  description: string
  inputSchema: z.ZodType<I, z.ZodTypeDef, unknown>
  outputSchema: z.ZodType<O, z.ZodTypeDef, unknown>
  permission: string // RBAC slug checked against the calling user (hasPermission)
  timeoutMs: number
  /** true = reads only. Tools that change state must be false and are never auto-run by agents (see runner). */
  readOnly: boolean
  handler: (input: I, ctx: ToolContext) => Promise<O>
}

export interface ToolContext {
  userId: string
  agentId: string
  requestId: string
}

export class ToolError extends Error {
  constructor(public code: 'UNKNOWN_TOOL' | 'NOT_ALLOWED' | 'FORBIDDEN' | 'INVALID_INPUT' | 'INVALID_OUTPUT' | 'TIMEOUT' | 'FAILED', message: string) {
    super(message)
    this.name = 'ToolError'
  }
}
