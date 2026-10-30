import crypto from 'crypto'
import { verifyTotp } from './totp'

// ---- secret encryption at rest (AES-256-GCM) ----
function key(): Buffer {
  const raw = process.env.TWO_FACTOR_ENCRYPTION_KEY || process.env.JWT_SECRET
  if (!raw || raw.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('TWO_FACTOR_ENCRYPTION_KEY (or JWT_SECRET) must be at least 32 characters in production')
    }
    return crypto.createHash('sha256').update('dev-only-2fa-key').digest()
  }
  return crypto.createHash('sha256').update(raw).digest()
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12)
  const c = crypto.createCipheriv('aes-256-gcm', key(), iv)
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()])
  return `v1.${iv.toString('base64')}.${c.getAuthTag().toString('base64')}.${enc.toString('base64')}`
}

export function decryptSecret(blob: string): string {
  const [v, iv, tag, data] = blob.split('.')
  if (v !== 'v1' || !iv || !tag || !data) throw new Error('Unsupported secret format')
  const d = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64'))
  d.setAuthTag(Buffer.from(tag, 'base64'))
  return Buffer.concat([d.update(Buffer.from(data, 'base64')), d.final()]).toString('utf8')
}

// ---- backup codes ----
const hashCode = (c: string) => crypto.createHash('sha256').update(c.replace(/-/g, '').toLowerCase()).digest('hex')

export function generateBackupCodes(n = 10): { plain: string[]; hashes: string[] } {
  const plain = Array.from({ length: n }, () => {
    const raw = crypto.randomBytes(5).toString('hex') // 10 hex chars
    return `${raw.slice(0, 5)}-${raw.slice(5)}`
  })
  return { plain, hashes: plain.map(hashCode) }
}

/** Consume a backup code. Returns remaining hashes if valid, else null. Single use. */
export function consumeBackupCode(storedJson: string | null | undefined, input: string): string[] | null {
  if (!storedJson) return null
  let hashes: string[]
  try { hashes = JSON.parse(storedJson) } catch { return null }
  const h = hashCode(input.trim())
  const idx = hashes.findIndex((x) => x.length === h.length && crypto.timingSafeEqual(Buffer.from(x), Buffer.from(h)))
  if (idx === -1) return null
  return hashes.filter((_, i) => i !== idx)
}

export const looksLikeBackupCode = (s: string) => /^[0-9a-f]{5}-?[0-9a-f]{5}$/i.test(s.trim())

export type TwoFactorCheck =
  | { ok: true; newLastStep?: number; remainingBackupHashes?: string[] }
  | { ok: false }

/** Verify a TOTP or backup code against a user's stored 2FA state. */
export function checkTwoFactor(
  user: { twoFactorSecret: string | null; twoFactorBackupCodes: string | null; twoFactorLastStep: number | null },
  code: string
): TwoFactorCheck {
  if (!user.twoFactorSecret) return { ok: false }
  const trimmed = code.trim()
  if (/^\d{6}$/.test(trimmed)) {
    const step = verifyTotp(decryptSecret(user.twoFactorSecret), trimmed, { lastUsedStep: user.twoFactorLastStep })
    return step === null ? { ok: false } : { ok: true, newLastStep: step }
  }
  if (looksLikeBackupCode(trimmed)) {
    const remaining = consumeBackupCode(user.twoFactorBackupCodes, trimmed)
    return remaining ? { ok: true, remainingBackupHashes: remaining } : { ok: false }
  }
  return { ok: false }
}
