export interface Chunk { index: number; text: string }

/**
 * Split text into overlapping chunks on paragraph/sentence boundaries.
 * Sizes are in characters (~4 chars ≈ 1 token): 1200 chars ≈ 300 tokens.
 */
export function chunkText(text: string, opts: { maxChars?: number; overlapChars?: number } = {}): Chunk[] {
  const maxChars = opts.maxChars ?? 1200
  const overlap = Math.min(opts.overlapChars ?? 150, Math.floor(maxChars / 3))
  const clean = text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim()
  if (!clean) return []
  if (clean.length <= maxChars) return [{ index: 0, text: clean }]

  // atoms: paragraphs, further split into sentences, further hard-split if still too long
  const atoms: string[] = []
  for (const para of clean.split(/\n{2,}/)) {
    if (para.length <= maxChars) { atoms.push(para.trim()); continue }
    for (const sent of para.split(/(?<=[.!?।])\s+/)) {
      if (sent.length <= maxChars) atoms.push(sent.trim())
      else for (let i = 0; i < sent.length; i += maxChars) atoms.push(sent.slice(i, i + maxChars))
    }
  }

  const chunks: Chunk[] = []
  let cur = ''
  for (const atom of atoms.filter(Boolean)) {
    if (cur && cur.length + atom.length + 1 > maxChars) {
      chunks.push({ index: chunks.length, text: cur })
      const tail = overlap > 0 ? cur.slice(-overlap) : ''
      cur = tail ? `${tail.slice(tail.indexOf(' ') + 1)} ${atom}` : atom // start overlap on a word boundary
    } else {
      cur = cur ? `${cur}\n${atom}` : atom
    }
  }
  if (cur.trim()) chunks.push({ index: chunks.length, text: cur })
  return chunks
}
