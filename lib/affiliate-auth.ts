import crypto from 'crypto'

export const VERIFY_TTL_MS = 48 * 60 * 60 * 1000
export const newVerifyToken = () => crypto.randomBytes(32).toString('base64url')
export const hashToken = (t: string) => crypto.createHash('sha256').update(t).digest('hex')
/** Short, unambiguous, unguessable referral code. */
export const newReferralCode = () => crypto.randomBytes(6).toString('base64url').replace(/[-_]/g, 'X').slice(0, 8).toUpperCase()
