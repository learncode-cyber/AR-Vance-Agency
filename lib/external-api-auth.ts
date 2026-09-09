import { NextResponse } from 'next/server'
import { prisma } from './prisma'
import { hashApiKey, type ApiScope } from './api-key'

/**
 * Validates the Authorization header of an external API request and
 * confirms the key has the required scope. Returns the ApiKey record on
 * success, or a ready-to-return NextResponse (401/403) on failure.
 */
export async function requireApiScope(
  req: Request,
  scope: ApiScope
): Promise<NextResponse | { id: string; name: string }> {
  const header = req.headers.get('authorization') ?? ''
  const raw = header.startsWith('Bearer ') ? header.slice(7).trim() : ''

  if (!raw) {
    return NextResponse.json(
      { data: null, meta: null, errors: [{ message: 'Missing Authorization: Bearer <api_key> header' }] },
      { status: 401 }
    )
  }

  const keyHash = hashApiKey(raw)
  const record = await prisma.apiKey.findUnique({ where: { keyHash } })

  if (!record || !record.active) {
    return NextResponse.json(
      { data: null, meta: null, errors: [{ message: 'Invalid or revoked API key' }] },
      { status: 401 }
    )
  }

  const scopes = Array.isArray(record.scopes) ? (record.scopes as string[]) : []
  if (!scopes.includes(scope)) {
    return NextResponse.json(
      { data: null, meta: null, errors: [{ message: `This API key does not have the "${scope}" scope` }] },
      { status: 403 }
    )
  }

  prisma.apiKey.update({ where: { id: record.id }, data: { lastUsedAt: new Date() } }).catch(() => {})

  return { id: record.id, name: record.name }
}
