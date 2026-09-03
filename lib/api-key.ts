import crypto from 'crypto'

const PREFIX = 'arq_'

/**
 * Generates a new raw API key + its hash for storage.
 * The raw key is shown to the admin ONCE at creation time and never
 * stored — only its SHA-256 hash is kept, so a leaked database backup
 * alone can't be used to authenticate as this key.
 */
export function generateApiKey() {
  const raw = PREFIX + crypto.randomBytes(32).toString('hex')
  const keyHash = hashApiKey(raw)
  const keyPrefix = raw.slice(0, 12)
  return { raw, keyHash, keyPrefix }
}

export function hashApiKey(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

export const API_SCOPES = [
  'leads:read',
  'services:read',
  'portfolio:read',
  'blog:read',
  'team:read',
  'testimonials:read',
] as const

export type ApiScope = (typeof API_SCOPES)[number]
