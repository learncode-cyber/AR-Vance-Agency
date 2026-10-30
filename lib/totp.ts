import crypto from 'crypto'

// RFC 4226 / 6238 TOTP (SHA-1, 6 digits, 30s) implemented on node:crypto —
// no third-party dependency, compatible with Google Authenticator, Authy, 1Password.

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
export const TOTP_STEP = 30
export const TOTP_DIGITS = 6

export function base32Encode(buf: Buffer): string {
  let bits = 0, value = 0, out = ''
  for (const byte of buf) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5 }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31]
  return out
}

export function base32Decode(str: string): Buffer {
  const clean = str.replace(/=+$/, '').replace(/\s+/g, '').toUpperCase()
  let bits = 0, value = 0
  const out: number[] = []
  for (const ch of clean) {
    const idx = B32.indexOf(ch)
    if (idx === -1) throw new Error('Invalid base32 character')
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8 }
  }
  return Buffer.from(out)
}

export function generateSecret(bytes = 20): string {
  return base32Encode(crypto.randomBytes(bytes))
}

export function hotp(secret: string, counter: number, digits = TOTP_DIGITS): string {
  const buf = Buffer.alloc(8)
  buf.writeBigUInt64BE(BigInt(counter))
  const hmac = crypto.createHmac('sha1', base32Decode(secret)).update(buf).digest()
  const offset = hmac[hmac.length - 1] & 0xf
  const bin =
    ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3]
  return (bin % 10 ** digits).toString().padStart(digits, '0')
}

export function currentStep(now = Date.now()): number {
  return Math.floor(now / 1000 / TOTP_STEP)
}

/**
 * Verify a code allowing ±`window` steps of clock drift. Returns the matched
 * time step (so the caller can reject replays of the same step) or null.
 */
export function verifyTotp(secret: string, code: string, opts: { now?: number; window?: number; lastUsedStep?: number | null } = {}): number | null {
  if (!/^\d{6}$/.test(code)) return null
  const window = opts.window ?? 1
  const step = currentStep(opts.now)
  let matched: number | null = null
  for (let w = -window; w <= window; w++) {
    const s = step + w
    const expected = hotp(secret, s)
    // constant-time compare; don't short-circuit so timing doesn't reveal which step matched
    const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(code))
    if (ok && matched === null) matched = s
  }
  if (matched === null) return null
  if (opts.lastUsedStep != null && matched <= opts.lastUsedStep) return null // replay
  return matched
}

export function otpauthUrl(opts: { secret: string; account: string; issuer: string }): string {
  const label = encodeURIComponent(`${opts.issuer}:${opts.account}`)
  const params = new URLSearchParams({ secret: opts.secret, issuer: opts.issuer, algorithm: 'SHA1', digits: String(TOTP_DIGITS), period: String(TOTP_STEP) })
  return `otpauth://totp/${label}?${params.toString()}`
}
