import prisma from './prisma'

/**
 * Check if user has permission
 */
export async function hasPermission(userId: string, permissionSlug: string): Promise<boolean> {
  try {
    // Get user's roles
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: { role: true },
    })

    if (userRoles.length === 0) return false

    // Check if any role has the permission
    for (const userRole of userRoles) {
      const permissions = JSON.parse(userRole.role.permissions || '[]')
      if (permissions.includes(permissionSlug)) {
        return true
      }
    }

    return false
  } catch (error) {
    console.error('Permission check error:', error)
    return false
  }
}

/**
 * Get user's permissions
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: { role: true },
    })

    const permissions = new Set<string>()

    for (const userRole of userRoles) {
      const rolePerms = JSON.parse(userRole.role.permissions || '[]')
      rolePerms.forEach((perm: string) => permissions.add(perm))
    }

    return Array.from(permissions)
  } catch (error) {
    console.error('Get permissions error:', error)
    return []
  }
}

/**
 * Get user's roles
 */
export async function getUserRoles(userId: string): Promise<string[]> {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: { role: true },
    })

    return userRoles.map((ur) => ur.role.slug)
  } catch (error) {
    console.error('Get roles error:', error)
    return []
  }
}

/**
 * Check if user has role
 */
export async function hasRole(userId: string, roleSlug: string): Promise<boolean> {
  try {
    const userRole = await prisma.userRole.findFirst({
      where: {
        userId,
        role: { slug: roleSlug },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    })

    return !!userRole
  } catch (error) {
    console.error('Role check error:', error)
    return false
  }
}

/**
 * Assign role to user
 */
export async function assignRole(userId: string, roleId: string, expiresAt?: Date) {
  try {
    const existing = await prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    })

    if (existing) {
      return await prisma.userRole.update({
        where: { userId_roleId: { userId, roleId } },
        data: { expiresAt },
      })
    }

    return await prisma.userRole.create({
      data: { userId, roleId, expiresAt },
    })
  } catch (error) {
    console.error('Assign role error:', error)
    throw error
  }
}

/**
 * Remove role from user
 */
export async function removeRole(userId: string, roleId: string) {
  try {
    await prisma.userRole.delete({
      where: { userId_roleId: { userId, roleId } },
    })
  } catch (error) {
    console.error('Remove role error:', error)
    throw error
  }
}

/**
 * Log activity
 */
export async function logActivity(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  resourceName: string,
  changes?: any
) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })

    await prisma.activityLog.create({
      data: {
        userId,
        userName: user?.name || 'Unknown',
        userEmail: user?.email || 'unknown@example.com',
        action,
        actionType: resourceType,
        resourceType,
        resourceId,
        resourceName,
        changes: changes ? JSON.stringify(changes) : '{}',
      },
    })
  } catch (error) {
    console.error('Activity log error:', error)
  }
}

/**
 * Create default roles
 */
export async function createDefaultRoles() {
  try {
    const roles = [
      {
        name: 'Admin',
        slug: 'admin',
        description: 'Full access to all features',
        roleType: 'admin',
        level: 0,
        permissions: [
          'manage_users',
          'manage_roles',
          'manage_pages',
          'manage_posts',
          'manage_portfolio',
          'manage_settings',
          'manage_team',
          'view_analytics',
          'manage_content',
          'approve_content',
        ],
      },
      {
        name: 'Editor',
        slug: 'editor',
        description: 'Can create and edit content',
        roleType: 'custom',
        level: 2,
        permissions: ['manage_pages', 'manage_posts', 'manage_content', 'view_analytics'],
      },
      {
        name: 'Sub Admin',
        slug: 'sub_admin',
        description: 'Can manage team and content',
        roleType: 'sub_admin',
        level: 1,
        permissions: [
          'manage_users',
          'manage_pages',
          'manage_posts',
          'manage_content',
          'view_analytics',
          'manage_team',
        ],
      },
      {
        name: 'Team Member',
        slug: 'member',
        description: 'Can view and edit assigned content',
        roleType: 'custom',
        level: 3,
        permissions: ['manage_content', 'view_analytics'],
      },
    ]

    for (const role of roles) {
      await prisma.role.upsert({
        where: { slug: role.slug },
        update: {},
        create: {
          ...role,
          permissions: JSON.stringify(role.permissions),
        },
      })
    }

    console.log('✅ Default roles created')
  } catch (error) {
    console.error('Create default roles error:', error)
  }
}
