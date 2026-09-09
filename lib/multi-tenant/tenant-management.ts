import { prisma } from '../prisma';
import { logger } from '../logging';

interface TenantData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  customDomain?: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
}

export class TenantManagement {
  static async createTenant(data: {
    name: string;
    slug: string;
    plan: 'starter' | 'professional' | 'enterprise';
    ownerId: string;
  }): Promise<TenantData | null> {
    try {
      const tenant = await prisma.tenant.create({
        data: {
          name: data.name,
          slug: data.slug,
          plan: data.plan,
          status: 'active',
          ownerId: data.ownerId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Tenant created', 'TenantManagement', { tenantId: tenant.id });
      return tenant as any;
    } catch (error) {
      logger.error('Failed to create tenant', error, 'TenantManagement');
      return null;
    }
  }

  static async getTenant(tenantId: string): Promise<TenantData | null> {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      return tenant as any;
    } catch (error) {
      logger.error('Failed to get tenant', error, 'TenantManagement');
      return null;
    }
  }

  static async updateTenant(
    tenantId: string,
    data: Partial<TenantData>
  ): Promise<boolean> {
    try {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      logger.info('Tenant updated', 'TenantManagement', { tenantId });
      return true;
    } catch (error) {
      logger.error('Failed to update tenant', error, 'TenantManagement');
      return false;
    }
  }

  static async getTenantBySlug(slug: string): Promise<TenantData | null> {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { slug },
      });

      return tenant as any;
    } catch (error) {
      logger.error('Failed to get tenant by slug', error, 'TenantManagement');
      return null;
    }
  }

  static async suspendTenant(tenantId: string): Promise<boolean> {
    try {
      await this.updateTenant(tenantId, { status: 'suspended' } as any);
      logger.warning('Tenant suspended', 'TenantManagement', { tenantId });
      return true;
    } catch (error) {
      logger.error('Failed to suspend tenant', error, 'TenantManagement');
      return false;
    }
  }

  static async deleteTenant(tenantId: string): Promise<boolean> {
    try {
      await this.updateTenant(tenantId, { status: 'deleted' } as any);
      logger.warning('Tenant deleted', 'TenantManagement', { tenantId });
      return true;
    } catch (error) {
      logger.error('Failed to delete tenant', error, 'TenantManagement');
      return false;
    }
  }

  static async getTenantUsers(tenantId: string) {
    try {
      const users = await prisma.user.findMany({
        where: { tenantId },
      });

      return users;
    } catch (error) {
      logger.error('Failed to get tenant users', error, 'TenantManagement');
      return [];
    }
  }

  static async getTenantUsage(tenantId: string) {
    try {
      const users = await prisma.user.count({
        where: { tenantId },
      });

      const orders = await prisma.order.count({
        where: { user: { tenantId } },
      });

      return {
        userCount: users,
        orderCount: orders,
        storageUsage: 0,
        apiCalls: 0,
      };
    } catch (error) {
      logger.error('Failed to get tenant usage', error, 'TenantManagement');
      return { userCount: 0, orderCount: 0, storageUsage: 0, apiCalls: 0 };
    }
  }
}
