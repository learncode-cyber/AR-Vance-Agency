/**
 * Safe, idempotent RBAC sync — run once after deploying the RBAC upgrade
 * (and any time the role/permission list in lib/rbac.ts changes).
 *
 *   npm run rbac:sync
 *
 * What it does (upserts only — it never deletes or overwrites user data):
 *  1. Creates/updates the default Role rows (permissions are synced).
 *  2. Gives every existing User a UserRole matching their legacy
 *     `User.role` string (admin -> admin, sub_admin -> sub_admin,
 *     editor -> editor, team_member -> member).
 *
 * Without step 2, an account that pre-dates the RBAC rollout has no
 * UserRole rows and only keeps write access through a temporary legacy
 * fallback in hasPermission().
 */
import { PrismaClient } from '@prisma/client'
import { createDefaultRoles } from '../lib/rbac'

const prisma = new PrismaClient()

const LEGACY_ROLE_TO_SLUG: Record<string, string> = {
  admin: 'admin',
  sub_admin: 'sub_admin',
  editor: 'editor',
  team_member: 'member',
  member: 'member',
}

async function main() {
  await createDefaultRoles()

  const roles = await prisma.role.findMany({ select: { id: true, slug: true } })
  const roleIdBySlug = new Map(roles.map((r) => [r.slug, r.id]))

  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } })
  let assigned = 0
  const skipped: string[] = []

  for (const user of users) {
    const slug = LEGACY_ROLE_TO_SLUG[user.role]
    const roleId = slug ? roleIdBySlug.get(slug) : undefined
    if (!roleId) {
      skipped.push(`${user.email} (legacy role "${user.role}" has no matching Role)`)
      continue
    }
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId } },
      update: {},
      create: { userId: user.id, roleId },
    })
    assigned++
  }

  console.log(`RBAC sync complete: ${assigned} user(s) assigned a role, ${skipped.length} skipped.`)
  skipped.forEach((s) => console.warn('  skipped:', s))
}

main()
  .catch((e) => {
    console.error('RBAC sync failed:', e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
