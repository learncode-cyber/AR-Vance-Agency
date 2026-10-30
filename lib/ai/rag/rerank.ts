import { cosine } from '@/lib/ai/vector/similarity';
import type { VectorMatch } from '@/lib/ai/vector/types';

const tokens = (s: string) => new Set(s.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? [])

/** Blend semantic score with lexical overlap so exact-term matches aren't lost. */
export function lexicalOverlap(query: string, text: string): number {
  const q = tokens(query); if (q.size === 0) return 0
  const t = tokens(text); let hit = 0
  for (const w of q) if (t.has(w)) hit++
  return hit / q.size
}

/**
 * Re-rank candidates: 0.8*semantic + 0.2*lexical, then Maximal Marginal Relevance
 * (lambda=0.7) to avoid returning near-duplicate chunks.
 */
export function rerank(query: string, candidates: VectorMatch[], k: number, lambda = 0.7): VectorMatch[] {
  const scored = candidates.map((c) => ({ ...c, score: 0.8 * c.score + 0.2 * lexicalOverlap(query, c.text) }))
  const pool = [...scored].sort((a, b) => b.score - a.score)
  const picked: VectorMatch[] = []
  while (picked.length < k && pool.length) {
    let bestIdx = 0, bestVal = -Infinity
    pool.forEach((c, i) => {
      const redundancy = picked.reduce((m, p) => (c.vector && p.vector ? Math.max(m, cosine(c.vector, p.vector)) : m), 0)
      const val = lambda * c.score - (1 - lambda) * redundancy
      if (val > bestVal) { bestVal = val; bestIdx = i }
    })
    picked.push(pool.splice(bestIdx, 1)[0])
  }
  return picked
}

/** Keep the best chunks that fit a character budget (~4 chars/token), dropping weak matches. */
export function selectContext(matches: VectorMatch[], opts: { maxChars?: number; minScore?: number } = {}): VectorMatch[] {
  const maxChars = opts.maxChars ?? 8000, minScore = opts.minScore ?? 0.3
  const out: VectorMatch[] = []; let used = 0
  for (const m of matches) {
    if (m.score < minScore) continue
    if (used + m.text.length > maxChars) continue
    out.push(m); used += m.text.length
  }
  return out
}
