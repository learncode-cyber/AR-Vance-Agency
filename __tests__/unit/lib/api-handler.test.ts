/** @jest-environment node */
import { withApi } from '@/lib/api-handler'
import { NotFoundError, AuthorizationError } from '@/lib/errors'

jest.mock('next/server', () => ({
  NextResponse: { json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) =>
    new Response(JSON.stringify(body), { status: init?.status ?? 200, headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) } }) },
}))

const req = (h: Record<string, string> = {}) => new Request('http://localhost/api/x?secret=1', { headers: h })

describe('withApi', () => {
  beforeEach(() => { jest.spyOn(console, 'error').mockImplementation(() => {}); jest.spyOn(console, 'warn').mockImplementation(() => {}) })
  afterEach(() => jest.restoreAllMocks())

  it('adds x-request-id on success', async () => {
    const res = await withApi(async () => new Response('ok'))(req())
    expect(res.headers.get('x-request-id')).toBeTruthy()
  })
  it('reuses an incoming request id', async () => {
    const res = await withApi(async () => new Response('ok'))(req({ 'x-request-id': 'abc-12345' }))
    expect(res.headers.get('x-request-id')).toBe('abc-12345')
  })
  it('maps AppError to its status and JSON body', async () => {
    const res = await withApi(async () => { throw new AuthorizationError() })(req())
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe('AUTHORIZATION_ERROR')
    expect(body.requestId).toBeTruthy()
  })
  it('never leaks internals for unexpected errors', async () => {
    const res = await withApi(async () => { throw new Error('connect ECONNREFUSED 10.0.0.5:3306 password=hunter2') })(req())
    expect(res.status).toBe(500)
    const text = await res.text()
    expect(text).not.toMatch(/ECONNREFUSED|hunter2|10\.0\.0\.5/)
  })
  it('404s via NotFoundError', async () => {
    const res = await withApi(async () => { throw new NotFoundError('Lead') })(req())
    expect(res.status).toBe(404)
  })
})

describe('request id validation', () => {
  it('replaces a malicious incoming request id', async () => {
    const { resolveRequestId } = await import('@/lib/request-id')
    const bad = 'x\r\nSet-Cookie: a=b'
    const id = resolveRequestId(bad)
    expect(id).not.toBe(bad); expect(id).toMatch(/^[0-9a-f-]{36}$/)
    expect(resolveRequestId('abc-12345')).toBe('abc-12345')
  })
})
