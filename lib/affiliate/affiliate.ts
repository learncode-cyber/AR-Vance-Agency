import { logger } from '../logging';

interface AffiliateData {
  id: string;
  email: string;
  name: string;
  affiliateCode: string;
  status: 'pending' | 'verified' | 'active' | 'suspended';
  totalEarnings: number;
  pendingEarnings: number;
  totalReferrals: number;
  commissionRate: number; // 10% default
  createdAt: Date;
  verifiedAt?: Date;
}

export class AffiliateService {
  private static affiliates = new Map<string, AffiliateData>();
  private static commissionRate = 0.10; // 10%

  static async createAffiliate(data: {
    email: string;
    name: string;
  }): Promise<AffiliateData | null> {
    try {
      const affiliateCode = this.generateAffiliateCode();
      const affiliate: AffiliateData = {
        id: `aff-${Date.now()}`,
        email: data.email,
        name: data.name,
        affiliateCode,
        status: 'pending',
        totalEarnings: 0,
        pendingEarnings: 0,
        totalReferrals: 0,
        commissionRate: this.commissionRate,
        createdAt: new Date(),
      };

      this.affiliates.set(affiliate.id, affiliate);
      logger.info('Affiliate created', 'AffiliateService', { affiliateId: affiliate.id, email: data.email });
      return affiliate;
    } catch (error) {
      logger.error('Failed to create affiliate', error, 'AffiliateService');
      return null;
    }
  }

  static async getAffiliate(affiliateId: string): Promise<AffiliateData | null> {
    try {
      return this.affiliates.get(affiliateId) || null;
    } catch (error) {
      logger.error('Failed to get affiliate', error, 'AffiliateService');
      return null;
    }
  }

  static async getAffiliateByCode(code: string): Promise<AffiliateData | null> {
    try {
      return Array.from(this.affiliates.values()).find(a => a.affiliateCode === code) || null;
    } catch (error) {
      logger.error('Failed to get affiliate by code', error, 'AffiliateService');
      return null;
    }
  }

  static async verifyAffiliate(affiliateId: string): Promise<boolean> {
    try {
      const affiliate = this.affiliates.get(affiliateId);
      if (!affiliate) return false;

      affiliate.status = 'verified';
      affiliate.verifiedAt = new Date();
      logger.info('Affiliate verified', 'AffiliateService', { affiliateId });
      return true;
    } catch (error) {
      logger.error('Failed to verify affiliate', error, 'AffiliateService');
      return false;
    }
  }

  static async addCommission(affiliateId: string, amount: number): Promise<boolean> {
    try {
      const affiliate = this.affiliates.get(affiliateId);
      if (!affiliate) return false;

      const commission = amount * this.commissionRate;
      affiliate.pendingEarnings += commission;
      affiliate.totalReferrals += 1;
      logger.info('Commission added', 'AffiliateService', { affiliateId, commission });
      return true;
    } catch (error) {
      logger.error('Failed to add commission', error, 'AffiliateService');
      return false;
    }
  }

  static async completeEarnings(affiliateId: string, amount: number): Promise<boolean> {
    try {
      const affiliate = this.affiliates.get(affiliateId);
      if (!affiliate) return false;

      if (affiliate.pendingEarnings >= amount) {
        affiliate.pendingEarnings -= amount;
        affiliate.totalEarnings += amount;
        logger.info('Earnings completed', 'AffiliateService', { affiliateId, amount });
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to complete earnings', error, 'AffiliateService');
      return false;
    }
  }

  private static generateAffiliateCode(): string {
    return `AFF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }
}
