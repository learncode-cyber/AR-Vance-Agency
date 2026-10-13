/**
 * Previously this file never imported lib/rbac.ts — it defined its own
 * local hasPermission() backed by a hand-rolled permissions map using
 * generic placeholder names ('read'/'write'/'delete') that don't even
 * match this app's real permission slugs (manage_content, manage_crm,
 * manage_commerce, manage_marketing, manage_ai, manage_users, manage_roles,
 * manage_settings, view_analytics). It could never catch a real regression
 * in lib/rbac.ts. Rewritten to mock only the Prisma layer and exercise the
 * actual exported hasPermission()/createDefaultRoles().
 */
import { hasPermission } from '@/lib/rbac'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    userRole: { findMany: jest.fn() },
    user: { findUnique: jest.fn() },
    role: { upsert: jest.fn() },
  },
}))
import { prisma } from '@/lib/prisma'

const mockedUserRoleFindMany = prisma.userRole.findMany as jest.Mock
const mockedUserFindUnique = prisma.user.findUnique as jest.Mock

describe('lib/rbac — hasPermission', () => {
  beforeEach(() => jest.clearAllMocks())

  it('grants access when an assigned role includes the permission', async () => {
    mockedUserRoleFindMany.mockResolvedValue([
      { role: { permissions: JSON.stringify(['manage_content', 'view_analytics']) } },
    ])
    await expect(hasPermission('user_1', 'manage_content')).resolves.toBe(true)
  })

  it('denies access when no assigned role includes the permission', async () => {
    mockedUserRoleFindMany.mockResolvedValue([
      { role: { permissions: JSON.stringify(['view_analytics']) } },
    ])
    await expect(hasPermission('user_1', 'manage_settings')).resolves.toBe(false)
  })

  it('checks across multiple assigned roles, not just the first', async () => {
    mockedUserRoleFindMany.mockResolvedValue([
      { role: { permissions: JSON.stringify(['view_analytics']) } },
      { role: { permissions: JSON.stringify(['manage_crm']) } },
    ])
    await expect(hasPermission('user_1', 'manage_crm')).resolves.toBe(true)
  })

  describe('legacy fallback (added when RBAC enforcement was first rolled out)', () => {
    it('allows a user with zero UserRole rows but a legacy admin role', async () => {
      mockedUserRoleFindMany.mockResolvedValue([])
      mockedUserFindUnique.mockResolvedValue({ role: 'admin' })
      await expect(hasPermission('legacy_admin', 'manage_settings')).resolves.toBe(true)
    })

    it('denies a user with zero UserRole rows and a non-admin legacy role', async () => {
      mockedUserRoleFindMany.mockResolvedValue([])
      mockedUserFindUnique.mockResolvedValue({ role: 'editor' })
      await expect(hasPermission('legacy_editor', 'manage_settings')).resolves.toBe(false)
    })

    it('denies a user that does not exist at all', async () => {
      mockedUserRoleFindMany.mockResolvedValue([])
      mockedUserFindUnique.mockResolvedValue(null)
      await expect(hasPermission('ghost_user', 'manage_settings')).resolves.toBe(false)
    })
  })
})
