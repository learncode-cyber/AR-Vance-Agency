import { logger } from '../logging';

interface PayoutRequest {
  id: string;
  affiliateId: string;
  amount: number;
  method: 'bank_transfer' | 'paypal' | 'stripe' | 'crypto' | 'manual';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

export class PayoutService {
  private static payouts = new Map<string, PayoutRequest>();
  private static minimumThreshold = 100; // $100

  static async createPayoutRequest(data: {
    affiliateId: string;
    amount: number;
    method: 'bank_transfer' | 'paypal' | 'stripe' | 'crypto' | 'manual';
  }): Promise<PayoutRequest | null> {
    try {
      if (data.amount < this.minimumThreshold) {
        logger.warning('Payout amount below threshold', 'PayoutService', { amount: data.amount });
        return null;
      }

      const payout: PayoutRequest = {
        id: `payout-${Date.now()}`,
        affiliateId: data.affiliateId,
        amount: data.amount,
        method: data.method,
        status: 'pending',
        createdAt: new Date(),
      };

      this.payouts.set(payout.id, payout);
      logger.info('Payout request created', 'PayoutService', { payoutId: payout.id, amount: data.amount });
      return payout;
    } catch (error) {
      logger.error('Failed to create payout request', error, 'PayoutService');
      return null;
    }
  }

  static async getPayout(payoutId: string): Promise<PayoutRequest | null> {
    try {
      return this.payouts.get(payoutId) || null;
    } catch (error) {
      logger.error('Failed to get payout', error, 'PayoutService');
      return null;
    }
  }

  static async processPayout(payoutId: string): Promise<boolean> {
    try {
      const payout = this.payouts.get(payoutId);
      if (!payout) return false;

      payout.status = 'processing';
      // Simulate processing
      setTimeout(() => {
        payout.status = 'completed';
        payout.completedAt = new Date();
      }, 5000);

      logger.info('Payout processing started', 'PayoutService', { payoutId });
      return true;
    } catch (error) {
      logger.error('Failed to process payout', error, 'PayoutService');
      return false;
    }
  }

  static async getPayoutHistory(affiliateId: string) {
    try {
      return Array.from(this.payouts.values()).filter(p => p.affiliateId === affiliateId);
    } catch (error) {
      logger.error('Failed to get payout history', error, 'PayoutService');
      return [];
    }
  }
}
