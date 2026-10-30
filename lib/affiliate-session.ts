import crypto from 'crypto'

// Affiliate sign-in uses a signed, httpOnly session cookie (30 days). The cookie carries only
// the affiliate id and an expiry, HMAC-signed with JWT_SECRET, so it cannot be forged or
// reused after expiry. Affiliates have no password; they sign in with an emailed one-time link.
export const AFF_SESSION_COOKIE = 'aff_session'
export const AFF_REF_COOKIE = 'aff_ref'
const SESSION_MS = 30 * 24 * 60 * 60 * 1000

function key(): string {
  const k = process.env.JWT_SECRET
  if (!k || k.length < 32) throw new Error('JWT_SECRET must be set (32+ chars) for affiliate sessions')
  return k
}
const sign = (payload: string) => crypto.createHmac('sha256', key()).update('aff:' + payload).digest('base64url')

export function createAffiliateSession(affiliateId: string, now = Date.now()): string {
  const payload = `${affiliateId}.${now + SESSION_MS}`
  return `${payload}.${sign(payload)}`
}

/** Returns the affiliate id if the cookie is authentic and unexpired, else null. */
export function readAffiliateSession(value: string | undefined | null, now = Date.now()): string | null {
  if (!value) return null
  const parts = value.split('.')
  if (parts.length !== 3) return null
  const [id, exp, mac] = parts
  const expected = sign(`${id}.${exp}`)
  const a = Buffer.from(mac), b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  if (!/^\d+$/.test(exp) || Number(exp) < now) return null
  return id
}

export const cookieOptions = (maxAgeSeconds: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: maxAgeSeconds,
})
export const SESSION_SECONDS = SESSION_MS / 1000

/** Commission for an order: rate% of the subtotal after discount, in cents-safe rounding. */
export function commissionFor(subtotal: number, discount: number, rate: number): number {
  const base = Math.max(0, subtotal - discount)
  return Math.round(base * rate) / 100
}
