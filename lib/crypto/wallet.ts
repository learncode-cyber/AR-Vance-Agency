import { logger } from '../logging';

interface CryptoWallet {
  id: string;
  userId: string;
  walletType: 'bitcoin' | 'ethereum' | 'solana';
  address: string;
  balance: number;
  currency: string;
  network: string;
  isActive: boolean;
  createdAt: Date;
}

export class WalletService {
  private static wallets = new Map<string, CryptoWallet>();

  static async createWallet(data: {
    userId: string;
    walletType: 'bitcoin' | 'ethereum' | 'solana';
    address: string;
    network: string;
  }): Promise<CryptoWallet | null> {
    try {
      const wallet: CryptoWallet = {
        id: `wallet-${Date.now()}`,
        userId: data.userId,
        walletType: data.walletType,
        address: data.address,
        balance: 0,
        currency: data.walletType.toUpperCase(),
        network: data.network,
        isActive: true,
        createdAt: new Date(),
      };

      this.wallets.set(wallet.id, wallet);
      logger.info('Wallet created', 'WalletService', { walletId: wallet.id });
      return wallet;
    } catch (error) {
      logger.error('Failed to create wallet', error, 'WalletService');
      return null;
    }
  }

  static async getWallet(walletId: string): Promise<CryptoWallet | null> {
    try {
      return this.wallets.get(walletId) || null;
    } catch (error) {
      logger.error('Failed to get wallet', error, 'WalletService');
      return null;
    }
  }

  static async getUserWallets(userId: string): Promise<CryptoWallet[]> {
    try {
      return Array.from(this.wallets.values()).filter((w) => w.userId === userId);
    } catch (error) {
      logger.error('Failed to get user wallets', error, 'WalletService');
      return [];
    }
  }

  static async updateBalance(walletId: string, amount: number): Promise<boolean> {
    try {
      const wallet = this.wallets.get(walletId);
      if (!wallet) return false;

      wallet.balance += amount;
      logger.info('Wallet balance updated', 'WalletService', { walletId, newBalance: wallet.balance });
      return true;
    } catch (error) {
      logger.error('Failed to update wallet balance', error, 'WalletService');
      return false;
    }
  }

  static async getTotalBalance(userId: string): Promise<number> {
    try {
      const wallets = await this.getUserWallets(userId);
      return wallets.reduce((sum, w) => sum + w.balance, 0);
    } catch (error) {
      logger.error('Failed to get total balance', error, 'WalletService');
      return 0;
    }
  }
}
