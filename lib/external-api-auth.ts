import { NextResponse } from 'next/server'
import { prisma } from './prisma'
import { hashApiKey, keyRejection, type ApiScope } from './api-key'
import { rateLimit } from './rate-limit'

const err = (status: number, message: string, headers?: Record<string, string>) =>
  NextResponse.json({ data: null, meta: null, errors: [{ message }] }, { status, headers })

/**
 * Validates the Authorization header of an external API request, then checks
 * (in order): key exists, not revoked, not expired, has the required scope,
 * and is within its per-key hourly rate limit. Returns the key record on
 * success, or a ready-to-return NextResponse (401/403/429) on failure.
 */
export async function requireApiScope(
  req: Request,
  scope: ApiScope
): Promise<NextResponse | { id: string; name: string }> {
  const header = req.headers.get('authorization') ?? ''
  const raw = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!raw) return err(401, 'Missing Authorization: Bearer <api_key> header')

  const record = await prisma.apiKey.findUnique({ where: { keyHash: hashApiKey(raw) } })
  // Same message for unknown/revoked/expired: don't reveal which keys exist.
  if (!record || keyRejection(record)) return err(401, 'Invalid, expired or revoked API key')

  const scopes = Array.isArray(record.scopes) ? (record.scopes as string[]) : []
  if (!scopes.includes(scope)) return err(403, `This API key does not have the "${scope}" scope`)

  const limit = await rateLimit(record.id, 'api-key', record.rateLimitPerHour, 60 * 60)
  if (!limit.success) return err(429, 'API key rate limit exceeded', { 'retry-after': '3600' })

  prisma.apiKey
    .update({ where: { id: record.id }, data: { lastUsedAt: new Date(), callCount: { increment: 1 } } })
    .catch(() => {})

  return { id: record.id, name: record.name }
}
