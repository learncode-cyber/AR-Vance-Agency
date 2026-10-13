import { prisma } from '../prisma';
import { logger } from '../logging';

export class TenantIsolation {
  private static currentTenant: string | null = null;

  // Set current tenant context
  static setTenantContext(tenantId: string) {
    this.currentTenant = tenantId;
  }

  // Get current tenant context
  static getTenantContext(): string | null {
    return this.currentTenant;
  }

  // Clear tenant context
  static clearTenantContext() {
    this.currentTenant = null;
  }

  // Filter query by tenant
  static addTenantFilter(query: any, tenantId: string) {
    if (!tenantId) {
      logger.warning('Tenant ID missing in filter', 'TenantIsolation');
      return query;
    }

    return {
      ...query,
      where: {
        ...query.where,
        tenantId,
      },
    };
  }

  // Check if user belongs to tenant
  static async checkUserTenant(userId: string, tenantId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) return false;

      return (user as any).tenantId === tenantId;
    } catch (error) {
      logger.error('Failed to check user tenant', error, 'TenantIsolation');
      return false;
    }
  }

  // Prevent cross-tenant access
  static async preventCrossTenantAccess(
    userId: string,
    tenantId: string,
    resourceId?: string
  ): Promise<boolean> {
    try {
      const belongs = await this.checkUserTenant(userId, tenantId);
      if (!belongs) {
        logger.warning('Cross-tenant access attempt blocked', 'TenantIsolation', {
          userId,
          tenantId,
        });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Cross-tenant access check failed', error, 'TenantIsolation');
      return false;
    }
  }

  // Audit tenant access
  static async auditTenantAccess(
    userId: string,
    tenantId: string,
    action: string
  ) {
    try {
      logger.info('Tenant access logged', 'TenantIsolation', {
        userId,
        tenantId,
        action,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Failed to log tenant access', error, 'TenantIsolation');
    }
  }
}
