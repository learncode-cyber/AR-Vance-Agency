/** @jest-environment node */
import { chunkText } from '@/lib/ai/rag/chunker'
import { rerank, selectContext, lexicalOverlap } from '@/lib/ai/rag/rerank'
import { MemoryVectorStore } from '@/lib/ai/vector/memory-store'
import { cosine } from '@/lib/ai/vector/similarity'

describe('chunkText', () => {
  it('returns [] for empty and one chunk for short text', () => {
    expect(chunkText('   ')).toEqual([])
    expect(chunkText('hello world')).toEqual([{ index: 0, text: 'hello world' }])
  })
  it('splits long text into bounded, overlapping, indexed chunks', () => {
    const text = Array.from({ length: 60 }, (_, i) => `Sentence number ${i} talks about marketing automation.`).join(' ')
    const chunks = chunkText(text, { maxChars: 400, overlapChars: 60 })
    expect(chunks.length).toBeGreaterThan(3)
    chunks.forEach((c, i) => { expect(c.index).toBe(i); expect(c.text.length).toBeLessThanOrEqual(400 + 80) })
    expect(chunks[1].text.slice(0, 20)).toBeTruthy()
  })
  it('hard-splits a single huge token run', () => {
    expect(chunkText('x'.repeat(5000), { maxChars: 1000 }).length).toBe(5)
  })
})

describe('vector store + rerank', () => {
  const rec = (id: string, v: number[], text: string, ns = 'o1') => ({ id, documentId: id.split(':')[0], chunkIndex: 0, text, vector: v, namespace: ns })
  it('returns nearest first and isolates namespaces', async () => {
    const s = new MemoryVectorStore()
    await s.upsert([rec('a:0', [1, 0], 'seo'), rec('b:0', [0, 1], 'ads'), rec('c:0', [1, 0], 'other tenant', 'o2')])
    const r = await s.query('o1', [1, 0.1], 5)
    expect(r.map((m) => m.id)).toEqual(['a:0', 'b:0'])
  })
  it('deleteByDocument removes only that document', async () => {
    const s = new MemoryVectorStore(); await s.upsert([rec('a:0', [1, 0], 'x'), rec('b:0', [1, 0], 'y')])
    await s.deleteByDocument('o1', 'a'); expect((await s.query('o1', [1, 0], 5)).map((m) => m.id)).toEqual(['b:0'])
  })
  it('cosine handles mismatched/zero vectors safely', () => {
    expect(cosine([1, 2], [1])).toBe(0); expect(cosine([0, 0], [1, 1])).toBe(0); expect(cosine([1, 1], [2, 2])).toBeCloseTo(1)
  })
  it('lexical overlap boosts exact-term matches', () => {
    expect(lexicalOverlap('pricing plans', 'Our pricing plans start low')).toBe(1)
    expect(lexicalOverlap('pricing plans', 'nothing here')).toBe(0)
  })
  it('MMR drops near-duplicates in favour of a diverse chunk', () => {
    const m = (id: string, score: number, v: number[], text: string) => ({ id, documentId: id, chunkIndex: 0, text, score, vector: v })
    const out = rerank('seo audit', [m('d1', 0.9, [1, 0], 'seo audit one'), m('d2', 0.89, [1, 0.01], 'seo audit copy'), m('d3', 0.7, [0, 1], 'seo audit different')], 2)
    expect(out.map((x) => x.id)).toEqual(['d1', 'd3'])
  })
  it('selectContext enforces score floor and character budget', () => {
    const m = (id: string, score: number, text: string) => ({ id, documentId: id, chunkIndex: 0, text, score })
    const out = selectContext([m('a', 0.9, 'x'.repeat(60)), m('b', 0.2, 'weak'), m('c', 0.8, 'y'.repeat(60)), m('d', 0.7, 'z'.repeat(10))], { maxChars: 100 })
    expect(out.map((x) => x.id)).toEqual(['a', 'd'])
  })
})
