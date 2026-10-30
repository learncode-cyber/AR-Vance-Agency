import { logger } from '../logging';

interface ResellerData {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  commissionRate: number;
  tier: 'starter' | 'professional' | 'enterprise';
  totalRevenue: number;
  totalCommission: number;
  status: 'active' | 'suspended';
  createdAt: Date;
}

export class ResellerService {
  private static resellers = new Map<string, ResellerData>();

  static async createReseller(data: Omit<ResellerData, 'id' | 'createdAt' | 'totalRevenue' | 'totalCommission'>): Promise<ResellerData | null> {
    try {
      const reseller: ResellerData = {
        ...data,
        id: `reseller-${Date.now()}`,
        createdAt: new Date(),
        totalRevenue: 0,
        totalCommission: 0,
      };

      this.resellers.set(reseller.id, reseller);
      logger.info('Reseller created', 'ResellerService', { resellerId: reseller.id });
      return reseller;
    } catch (error) {
      logger.error('Failed to create reseller', error, 'ResellerService');
      return null;
    }
  }

  static async getReseller(resellerId: string): Promise<ResellerData | null> {
    try {
      return this.resellers.get(resellerId) || null;
    } catch (error) {
      logger.error('Failed to get reseller', error, 'ResellerService');
      return null;
    }
  }

  static async getResellersByTenant(tenantId: string): Promise<ResellerData[]> {
    try {
      return Array.from(this.resellers.values()).filter(r => r.tenantId === tenantId);
    } catch (error) {
      logger.error('Failed to get resellers', error, 'ResellerService');
      return [];
    }
  }

  static calculateCommission(revenue: number, commissionRate: number): number {
    return revenue * (commissionRate / 100);
  }

  static getCommissionStructure(tier: string) {
    const structures: Record<string, number> = {
      starter: 20,
      professional: 30,
      enterprise: 40,
    };
    return structures[tier] || 20;
  }
}
