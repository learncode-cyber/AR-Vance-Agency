/** @jest-environment node */
const setAttribute = jest.fn(); const setStatus = jest.fn(); const startSpan = jest.fn(); const setTag = jest.fn()
jest.mock('@sentry/nextjs', () => ({
  startSpan: (opts: unknown, cb: (s: unknown) => unknown) => { startSpan(opts); return cb({ setAttribute, setStatus }) },
  getCurrentScope: () => ({ setTag }),
}))
import { withSpan, tagRequest } from '@/lib/telemetry'

beforeEach(() => { setAttribute.mockClear(); setStatus.mockClear(); startSpan.mockClear(); setTag.mockClear() })

describe('withSpan', () => {
  it('returns the callback result and passes op/attributes (undefined dropped)', async () => {
    const r = await withSpan('model x', 'ai.model', { a: 1, b: undefined, c: 'z' }, async () => 42)
    expect(r).toBe(42)
    expect(startSpan).toHaveBeenCalledWith({ name: 'model x', op: 'ai.model', attributes: { a: 1, c: 'z' } })
  })
  it('lets the callback attach attributes later', async () => {
    await withSpan('t', 'op', {}, async (set) => { set({ 'ai.tokens.input': 10, skip: undefined }) })
    expect(setAttribute).toHaveBeenCalledTimes(1); expect(setAttribute).toHaveBeenCalledWith('ai.tokens.input', 10)
  })
  it('marks the span errored with only the error class, and rethrows', async () => {
    await expect(withSpan('t', 'op', {}, async () => { throw new TypeError('secret user data') })).rejects.toThrow('secret user data')
    expect(setStatus).toHaveBeenCalledWith({ code: 2, message: 'TypeError' })
  })
  it('tags the request id on the scope', () => { tagRequest('abc-12345'); expect(setTag).toHaveBeenCalledWith('request_id', 'abc-12345') })
})
