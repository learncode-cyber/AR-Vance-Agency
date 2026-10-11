import { parseLimit, parseCursor, toPage } from '@/lib/pagination'

describe('pagination', () => {
  it('parseLimit clamps and falls back', () => {
    expect(parseLimit(null)).toBe(25); expect(parseLimit('abc')).toBe(25); expect(parseLimit('0')).toBe(25); expect(parseLimit('-5')).toBe(25)
    expect(parseLimit('10')).toBe(10); expect(parseLimit('9999')).toBe(100)
  })
  it('parseCursor accepts ids and rejects junk (no injection into the query)', () => {
    expect(parseCursor('clx1abc2def3ghi4')).toBe('clx1abc2def3ghi4')
    expect(parseCursor(null)).toBeUndefined(); expect(parseCursor('')).toBeUndefined()
    for (const bad of ['a', "x'; DROP TABLE Lead;--", '../etc/passwd', 'a'.repeat(65), '{"$ne":1}']) expect(parseCursor(bad)).toBeUndefined()
  })
  it('toPage returns a cursor only when there is another page', () => {
    const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `id${i}` }))
    expect(toPage(rows(3), 2)).toEqual({ items: [{ id: 'id0' }, { id: 'id1' }], nextCursor: 'id1' })
    expect(toPage(rows(2), 2)).toEqual({ items: rows(2), nextCursor: null })
    expect(toPage([], 2)).toEqual({ items: [], nextCursor: null })
  })
})
