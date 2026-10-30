import crypto from 'crypto'

export const STRIPE_TOLERANCE_SECONDS = 300

export type StripeSigResult = { ok: true } | { ok: false; reason: 'missing_header' | 'malformed_header' | 'stale_timestamp' | 'bad_signature' }

/**
 * Verify a Stripe webhook `Stripe-Signature` header (scheme v1: HMAC-SHA256 of
 * `${timestamp}.${rawBody}`), with replay protection via a timestamp tolerance.
 * Implemented on node:crypto so the app needs no Stripe SDK for this.
 * `rawBody` MUST be the exact bytes received (call req.text(), not req.json()).
 */
export function verifyStripeSignature(
  rawBody: string,
  header: string | null | undefined,
  secret: string,
  opts: { now?: number; toleranceSeconds?: number } = {}
): StripeSigResult {
  if (!header) return { ok: false, reason: 'missing_header' }

  let timestamp = ''
  const v1: string[] = []
  for (const part of header.split(',')) {
    const i = part.indexOf('=')
    if (i === -1) continue
    const k = part.slice(0, i).trim(), v = part.slice(i + 1).trim()
    if (k === 't') timestamp = v
    else if (k === 'v1') v1.push(v)
  }
  if (!/^\d{1,12}$/.test(timestamp) || v1.length === 0) return { ok: false, reason: 'malformed_header' }

  const now = Math.floor((opts.now ?? Date.now()) / 1000)
  if (Math.abs(now - Number(timestamp)) > (opts.toleranceSeconds ?? STRIPE_TOLERANCE_SECONDS)) return { ok: false, reason: 'stale_timestamp' }

  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')
  const exp = Buffer.from(expected, 'hex')
  const match = v1.some((sig) => {
    if (!/^[0-9a-f]{64}$/i.test(sig)) return false
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), exp)
  })
  return match ? { ok: true } : { ok: false, reason: 'bad_signature' }
}
