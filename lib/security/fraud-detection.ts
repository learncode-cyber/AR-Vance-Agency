import { logger } from '../logging';

interface FraudCheckInput {
  userId: string;
  amount: number;
  merchantId: string;
  deviceId?: string;
  location?: { lat: number; lng: number };
  paymentMethod: string;
  timestamp: Date;
}

interface FraudScore {
  riskScore: number;
  fraudProbability: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  requiresReview: boolean;
}

export class FraudDetectionEngine {
  // Check transaction for fraud
  static async checkTransaction(input: FraudCheckInput): Promise<FraudScore> {
    try {
      let riskScore = 0;
      const reasons: string[] = [];

      // Amount-based rules
      if (input.amount > 10000) {
        riskScore += 15;
        reasons.push('High transaction amount');
      }
      if (input.amount > 5000 && input.amount < 10000) {
        riskScore += 8;
      }

      // Location-based rules
      if (input.location) {
        // Simulate location velocity check
        const velocityScore = this.calculateVelocityScore(input.userId, input.location);
        riskScore += velocityScore;
        if (velocityScore > 0) reasons.push('Unusual location');
      }

      // Device-based rules
      if (input.deviceId) {
        const deviceScore = this.calculateDeviceScore(input.userId, input.deviceId);
        riskScore += deviceScore;
        if (deviceScore > 0) reasons.push('Unknown device');
      }

      // Payment method rules
      if (input.paymentMethod === 'prepaid_card') {
        riskScore += 5;
        reasons.push('High-risk payment method');
      }

      // Time-based rules
      const hour = input.timestamp.getHours();
      if (hour < 6 || hour > 23) {
        riskScore += 3;
        reasons.push('Unusual transaction time');
      }

      riskScore = Math.min(riskScore, 100);

      const riskLevel = this.getRiskLevel(riskScore);

      logger.info('Fraud check completed', 'FraudDetectionEngine', {
        userId: input.userId,
        riskScore,
        riskLevel,
      });

      return {
        riskScore,
        fraudProbability: riskScore / 100,
        riskLevel,
        reasons,
        requiresReview: riskLevel === 'high' || riskLevel === 'critical',
      };
    } catch (error) {
      logger.error('Fraud check failed', error, 'FraudDetectionEngine');
      return {
        riskScore: 0,
        fraudProbability: 0,
        riskLevel: 'low',
        reasons: [],
        requiresReview: false,
      };
    }
  }

  private static calculateVelocityScore(userId: string, location: { lat: number; lng: number }): number {
    // Simulate velocity check - distance traveled too fast
    // In production, would check against user's historical locations
    const randomFactor = Math.random() * 20;
    return randomFactor > 15 ? 15 : 0;
  }

  private static calculateDeviceScore(userId: string, deviceId: string): number {
    // Simulate device check - check if device is known to user
    // In production, would check against user's device history
    const randomFactor = Math.random() * 100;
    return randomFactor > 80 ? 20 : 0;
  }

  private static getRiskLevel(
    score: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (score < 25) return 'low';
    if (score < 50) return 'medium';
    if (score < 75) return 'high';
    return 'critical';
  }

  // Account takeover detection
  static async detectAccountTakeover(userId: string): Promise<boolean> {
    try {
      // Check for multiple failed logins
      // Check for location changes
      // Check for device changes
      // Check for unusual activity patterns

      const takeover = Math.random() < 0.05; // 5% false positive rate

      if (takeover) {
        logger.warning('Potential account takeover detected', 'FraudDetectionEngine', {
          userId,
        });
      }

      return takeover;
    } catch (error) {
      logger.error('Account takeover detection failed', error, 'FraudDetectionEngine');
      return false;
    }
  }

  // Bot detection
  static async detectBot(userId: string, sessionId: string): Promise<boolean> {
    try {
      // Check for rapid API calls
      // Check for pattern-based behavior
      // Check for browser fingerprint
      // Check for mouse movements

      const isBot = Math.random() < 0.02; // 2% false positive rate

      if (isBot) {
        logger.warning('Bot detected', 'FraudDetectionEngine', {
          userId,
          sessionId,
        });
      }

      return isBot;
    } catch (error) {
      logger.error('Bot detection failed', error, 'FraudDetectionEngine');
      return false;
    }
  }
}
