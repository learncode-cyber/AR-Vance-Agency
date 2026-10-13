import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'
import { generateApiKey } from '@/lib/api-key'

const patchSchema = z.object({
  active: z.boolean().optional(),
  rateLimitPerHour: z.number().int().min(1).max(100_000).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
})
const publicSelect = { id: true, name: true, keyPrefix: true, scopes: true, active: true, expiresAt: true, revokedAt: true, rateLimitPerHour: true } as const

async function guard() {
  const session = await getAdminSession()
  if (!session) return { res: unauthorized() }
  if (!(await hasPermission(session.userId, 'manage_settings'))) {
    return { res: NextResponse.json({ error: 'Access Denied' }, { status: 403 }) }
  }
  return { session }
}

// Update limits/expiry, or re-activate. Revoked keys can't be re-activated
// (rotate to get a fresh key instead).
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(); if (g.res) return g.res
  const { id } = await params
  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  const d = parsed.data

  const existing = await prisma.apiKey.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Key not found' }, { status: 404 })
  if (existing.revokedAt && d.active) {
    return NextResponse.json({ error: 'Revoked keys cannot be re-activated. Rotate to issue a new key.' }, { status: 409 })
  }

  const updated = await prisma.apiKey.update({
    where: { id },
    data: {
      ...(d.active !== undefined ? { active: d.active } : {}),
      ...(d.rateLimitPerHour ? { rateLimitPerHour: d.rateLimitPerHour } : {}),
      ...(d.expiresAt !== undefined ? { expiresAt: d.expiresAt ? new Date(d.expiresAt) : null } : {}),
    },
    select: publicSelect,
  })
  await logActivity(g.session!.userId, 'api_key_updated', 'api_key', id, existing.name, d)
  return NextResponse.json({ data: updated })
}

// Rotate: atomically revoke this key and issue a replacement with the same
// scopes/limits. The new raw key is returned once.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(); if (g.res) return g.res
  const { id } = await params
  const old = await prisma.apiKey.findUnique({ where: { id } })
  if (!old) return NextResponse.json({ error: 'Key not found' }, { status: 404 })
  if (old.revokedAt) return NextResponse.json({ error: 'Key is already revoked' }, { status: 409 })

  const { raw, keyHash, keyPrefix } = generateApiKey()
  const [, created] = await prisma.$transaction([
    prisma.apiKey.update({ where: { id }, data: { active: false, revokedAt: new Date() } }),
    prisma.apiKey.create({
      data: {
        name: old.name, keyHash, keyPrefix, scopes: old.scopes as string[], createdBy: g.session!.userId,
        rateLimitPerHour: old.rateLimitPerHour, expiresAt: old.expiresAt, rotatedFromId: old.id,
      },
      select: publicSelect,
    }),
  ])
  await logActivity(g.session!.userId, 'api_key_rotated', 'api_key', id, old.name, { newKeyId: created.id })
  return NextResponse.json({ data: created, key: raw }, { status: 201 })
}

// Revoke (soft): keeps the record for the audit trail but it can never authenticate again.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(); if (g.res) return g.res
  const { id } = await params
  const existing = await prisma.apiKey.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Key not found' }, { status: 404 })
  await prisma.apiKey.update({ where: { id }, data: { active: false, revokedAt: existing.revokedAt ?? new Date() } })
  await logActivity(g.session!.userId, 'api_key_revoked', 'api_key', id, existing.name)
  return NextResponse.json({ success: true })
}
