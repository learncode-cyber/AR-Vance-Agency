import { hasPermission, logActivity } from '@/lib/rbac'
import { ToolDefinition, ToolContext, ToolError } from './types'
import { withSpan } from '@/lib/telemetry'

const tools = new Map<string, ToolDefinition<any, any>>()

export function registerTool<I, O>(tool: ToolDefinition<I, O>): void {
  if (!/^[a-z0-9_]+\.[a-z0-9_]+$/.test(tool.name)) throw new Error(`Invalid tool name "${tool.name}" (use domain.action)`)
  if (tools.has(tool.name)) throw new Error(`Tool "${tool.name}" already registered`)
  if (tool.timeoutMs <= 0 || tool.timeoutMs > 30_000) throw new Error(`Tool "${tool.name}" timeout must be 1..30000ms`)
  tools.set(tool.name, tool)
}

export function getTool(name: string): ToolDefinition<any, any> | undefined {
  return tools.get(name)
}
export function listTools(): ToolDefinition<any, any>[] {
  return [...tools.values()]
}
/** Test helper. */
export function _resetTools(): void {
  tools.clear()
}

function withTimeout<T>(p: Promise<T>, ms: number, name: string): Promise<T> {
  let t: NodeJS.Timeout
  return Promise.race([
    p.finally(() => clearTimeout(t)),
    new Promise<T>((_, rej) => { t = setTimeout(() => rej(new ToolError('TIMEOUT', `Tool "${name}" timed out after ${ms}ms`)), ms) }),
  ])
}

/**
 * Execute a tool on behalf of an agent. Enforces, in order:
 *  1. the tool exists
 *  2. the agent's allowlist includes it
 *  3. the calling USER holds the tool's permission (agents never exceed their user)
 *  4. input passes the Zod schema
 *  5. timeout
 *  6. output passes the Zod schema (so a buggy handler can't leak extra fields)
 * Every call (success or failure) is written to the activity/audit log.
 */
export async function executeTool(
  name: string,
  rawInput: unknown,
  ctx: ToolContext & { allowedTools: readonly string[] }
): Promise<unknown> {
  const audit = (status: string, extra?: Record<string, unknown>) =>
    logActivity(ctx.userId, `ai_tool_${status}`, 'ai_tool', ctx.requestId, name, { agent: ctx.agentId, ...extra })

  const tool = tools.get(name)
  if (!tool) { await audit('unknown'); throw new ToolError('UNKNOWN_TOOL', `Unknown tool "${name}"`) }
  if (!ctx.allowedTools.includes(name)) { await audit('denied', { reason: 'not in agent allowlist' }); throw new ToolError('NOT_ALLOWED', `Agent "${ctx.agentId}" may not use "${name}"`) }
  if (!(await hasPermission(ctx.userId, tool.permission))) { await audit('denied', { reason: `missing ${tool.permission}` }); throw new ToolError('FORBIDDEN', `Missing permission "${tool.permission}"`) }

  const parsed = tool.inputSchema.safeParse(rawInput)
  if (!parsed.success) { await audit('invalid_input'); throw new ToolError('INVALID_INPUT', parsed.error.errors[0]?.message ?? 'Invalid tool input') }

  const started = Date.now()
  try {
    const out = await withSpan(`tool ${name}`, 'ai.tool', { 'ai.tool': name, 'ai.agent': ctx.agentId, request_id: ctx.requestId }, () =>
      withTimeout(tool.handler(parsed.data, ctx), tool.timeoutMs, name)
    )
    const checked = tool.outputSchema.safeParse(out)
    if (!checked.success) { await audit('invalid_output'); throw new ToolError('INVALID_OUTPUT', `Tool "${name}" returned unexpected data`) }
    await audit('ok', { ms: Date.now() - started })
    return checked.data
  } catch (err) {
    if (err instanceof ToolError) { if (err.code === 'TIMEOUT') await audit('timeout'); throw err }
    await audit('failed', { ms: Date.now() - started })
    throw new ToolError('FAILED', `Tool "${name}" failed`)
  }
}
