import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const DEV_FALLBACK_SECRET = 'dev-secret-change-this-in-production-min-32-chars'

/**
 * Resolves the JWT signing secret. In production this throws instead of
 * silently falling back to a public, hardcoded value — a missing/weak
 * JWT_SECRET in production would otherwise let anyone forge admin tokens.
 * Evaluated lazily (on first sign/verify call) so module import alone
 * — e.g. during build-time static analysis — never crashes the build;
 * only an actual attempt to sign/verify a token without a real secret does.
 */
function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (secret && secret.length >= 32) return secret

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET is missing or shorter than 32 characters. Refusing to start ' +
      'in production with an insecure/default secret — set a strong JWT_SECRET ' +
      'in the environment before deploying.'
    )
  }

  // eslint-disable-next-line no-console
  console.warn(
    '[auth] JWT_SECRET is missing or weak — using an insecure development-only ' +
    'fallback. This is fine for local dev but must never happen in production.'
  )
  return DEV_FALLBACK_SECRET
}

export interface AdminPayload {
  userId: string
  email:  string
  role:   string
}

export function signToken(payload: AdminPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '24h' })
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, getSecret()) as AdminPayload
  } catch {
    return null
  }
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export const COOKIE_NAME = 'admin_token'
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge:   60 * 60 * 24, // 24h
  path:     '/',
}
