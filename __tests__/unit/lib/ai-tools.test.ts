/** @jest-environment node */
import { z } from 'zod'

const hasPermission = jest.fn()
const logActivity = jest.fn().mockResolvedValue(undefined)
jest.mock('@/lib/rbac', () => ({ hasPermission: (...a: unknown[]) => hasPermission(...a), logActivity: (...a: unknown[]) => logActivity(...a) }))
jest.mock('@/lib/prisma', () => ({ prisma: {} }))

import { registerTool, executeTool, _resetTools } from '@/lib/ai/tools/registry'
import { ToolError } from '@/lib/ai/tools/types'

const ctx = (allowed: string[]) => ({ userId: 'u1', agentId: 'a1', requestId: 'r1', allowedTools: allowed })

beforeEach(() => {
  _resetTools(); hasPermission.mockReset().mockResolvedValue(true); logActivity.mockClear()
  registerTool({
    name: 'demo.echo', description: 'echo', permission: 'manage_crm', timeoutMs: 100, readOnly: true,
    inputSchema: z.object({ n: z.number().int().max(5) }),
    outputSchema: z.object({ n: z.number() }),
    handler: async ({ n }) => ({ n, secret: 'leak' } as any),
  })
})

const code = async (p: Promise<unknown>) => p.then(() => 'ok', (e) => (e as ToolError).code)

describe('executeTool', () => {
  it('runs an allowed tool, validates output and strips extra fields', async () => {
    expect(await executeTool('demo.echo', { n: 3 }, ctx(['demo.echo']))).toEqual({ n: 3 })
  })
  it('rejects unknown tools', async () => { expect(await code(executeTool('nope.x', {}, ctx(['nope.x'])))).toBe('UNKNOWN_TOOL') })
  it('rejects tools outside the agent allowlist', async () => { expect(await code(executeTool('demo.echo', { n: 1 }, ctx([])))).toBe('NOT_ALLOWED') })
  it('rejects when the calling user lacks the permission', async () => {
    hasPermission.mockResolvedValue(false)
    expect(await code(executeTool('demo.echo', { n: 1 }, ctx(['demo.echo'])))).toBe('FORBIDDEN')
    expect(hasPermission).toHaveBeenCalledWith('u1', 'manage_crm')
  })
  it('rejects invalid input', async () => { expect(await code(executeTool('demo.echo', { n: 99 }, ctx(['demo.echo'])))).toBe('INVALID_INPUT') })
  it('times out slow handlers', async () => {
    registerTool({ name: 'demo.slow', description: 's', permission: 'p', timeoutMs: 50, readOnly: true, inputSchema: z.object({}), outputSchema: z.object({}), handler: () => new Promise(() => {}) })
    expect(await code(executeTool('demo.slow', {}, ctx(['demo.slow'])))).toBe('TIMEOUT')
  })
  it('hides handler errors behind a generic FAILED', async () => {
    registerTool({ name: 'demo.boom', description: 'b', permission: 'p', timeoutMs: 100, readOnly: true, inputSchema: z.object({}), outputSchema: z.object({}), handler: async () => { throw new Error('SELECT * FROM users password=x') } })
    const e = (await executeTool('demo.boom', {}, ctx(['demo.boom'])).catch((x) => x)) as ToolError
    expect(e.code).toBe('FAILED'); expect(e.message).not.toMatch(/SELECT|password/)
  })
  it('audits every outcome', async () => {
    await executeTool('demo.echo', { n: 1 }, ctx(['demo.echo']))
    await code(executeTool('demo.echo', { n: 1 }, ctx([])))
    expect(logActivity.mock.calls.map((c) => c[1])).toEqual(['ai_tool_ok', 'ai_tool_denied'])
  })
  it('refuses to register bad names, duplicates and huge timeouts', () => {
    const base = { description: 'x', permission: 'p', readOnly: true, inputSchema: z.object({}), outputSchema: z.object({}), handler: async () => ({}) }
    expect(() => registerTool({ ...base, name: 'Bad Name', timeoutMs: 10 })).toThrow()
    expect(() => registerTool({ ...base, name: 'demo.echo', timeoutMs: 10 })).toThrow(/already/)
    expect(() => registerTool({ ...base, name: 'demo.long', timeoutMs: 999999 })).toThrow()
  })
})
