import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'
import { generateApiKey, isValidScope } from '@/lib/api-key'

const createKeySchema = z.object({
  name: z.string().min(3).max(100),
  scopes: z.array(z.string().refine(isValidScope, 'Unknown scope')).min(1, 'Pick at least one scope'),
  rateLimitPerHour: z.number().int().min(1).max(100_000).optional(),
  expiresAt: z.string().datetime().optional(),
})

const publicSelect = {
  id: true, name: true, keyPrefix: true, scopes: true, active: true, lastUsedAt: true,
  callCount: true, expiresAt: true, revokedAt: true, rateLimitPerHour: true, createdAt: true, rotatedFromId: true,
} as const

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()
  if (!(await hasPermission(session.userId, 'manage_settings'))) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
  }

  const url = new URL(req.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1') || 1)
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20') || 20))
  const active = url.searchParams.get('active')
  const where = active ? { active: active === 'true' } : {}

  try {
    const [keys, total] = await Promise.all([
      prisma.apiKey.findMany({ where, select: publicSelect, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.apiKey.count({ where }),
    ])
    return NextResponse.json({ data: keys, pagination: { total, page, limit, pages: Math.ceil(total / limit) } })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()
  if (!(await hasPermission(session.userId, 'manage_settings'))) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
  }

  const parsed = createKeySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
  const d = parsed.data
  if (d.expiresAt && new Date(d.expiresAt) <= new Date()) {
    return NextResponse.json({ error: 'expiresAt must be in the future' }, { status: 400 })
  }

  try {
    const { raw, keyHash, keyPrefix } = generateApiKey()
    const created = await prisma.apiKey.create({
      data: {
        name: d.name, keyHash, keyPrefix, scopes: d.scopes, createdBy: session.userId,
        ...(d.rateLimitPerHour ? { rateLimitPerHour: d.rateLimitPerHour } : {}),
        ...(d.expiresAt ? { expiresAt: new Date(d.expiresAt) } : {}),
      },
      select: publicSelect,
    })
    await logActivity(session.userId, 'api_key_created', 'api_key', created.id, created.name, { scopes: d.scopes, expiresAt: d.expiresAt ?? null })
    // The raw key is returned exactly once; only its hash is stored.
    return NextResponse.json({ data: created, key: raw }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
  }
}
