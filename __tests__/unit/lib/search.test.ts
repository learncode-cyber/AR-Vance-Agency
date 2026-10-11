/** @jest-environment node */
jest.mock('@/lib/prisma', () => ({ prisma: {} }))
import { searchSite, normalizeQuery } from '@/lib/search'
import { makeEsProvider } from '@/lib/search/es-provider'
import type { SearchProvider } from '@/lib/search/types'

const fake = (name: string, impl: () => Promise<any>, available = true): SearchProvider => ({ name, isAvailable: () => available, search: impl })
const q = { q: 'seo', limit: 5 }

describe('searchSite', () => {
  beforeEach(() => jest.spyOn(console, 'warn').mockImplementation(() => {}))
  it('uses the primary provider when healthy', async () => {
    const r = await searchSite(q, { primary: fake('es', async () => ({ total: 1, hits: [] })), fallback: fake('db', async () => ({ total: 9, hits: [] })) })
    expect(r.provider).toBe('es'); expect(r.total).toBe(1)
  })
  it('falls back to the database when the primary throws', async () => {
    const r = await searchSite(q, { primary: fake('es', async () => { throw new Error('down') }), fallback: fake('db', async () => ({ total: 2, hits: [] })) })
    expect(r.provider).toBe('db'); expect(r.total).toBe(2)
  })
  it('skips an unavailable primary', async () => {
    const r = await searchSite(q, { primary: fake('es', async () => { throw new Error('never') }, false), fallback: fake('db', async () => ({ total: 0, hits: [] })) })
    expect(r.provider).toBe('db')
  })
})

describe('normalizeQuery', () => {
  it('trims, collapses whitespace and bounds length', () => {
    expect(normalizeQuery('  web   design ')).toBe('web design')
    expect(normalizeQuery('a')).toBeNull(); expect(normalizeQuery('x'.repeat(101))).toBeNull(); expect(normalizeQuery('\u0000\u0001')).toBeNull()
  })
})

describe('elasticsearch provider', () => {
  it('maps hits and drops entries with non-relative URLs', async () => {
    const es = { search: jest.fn(async () => ({ hits: { total: { value: 2 }, hits: [
      { _source: { type: 'post', title: 'A', url: '/blog/a', snippet: 's' } },
      { _source: { type: 'post', title: 'Evil', url: 'https://evil.example/x', snippet: 's' } },
    ] } })) }
    const r = await makeEsProvider(async () => es).search({ q: 'a', limit: 5, types: ['post'] })
    expect(r.hits).toEqual([{ type: 'post', title: 'A', url: '/blog/a', snippet: 's' }]); expect(r.total).toBe(2)
    expect(JSON.stringify(es.search.mock.calls[0])).toContain('"terms"')
  })
  it('throws when no client so the caller can fall back', async () => {
    await expect(makeEsProvider(async () => null).search({ q: 'a', limit: 1 })).rejects.toThrow()
  })
})
