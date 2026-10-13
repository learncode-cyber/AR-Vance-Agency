import { logger } from '../logging';

interface AnomalyInput {
  userId: string;
  eventType: 'login' | 'transaction' | 'api_call' | 'data_access';
  value: number;
  metadata?: Record<string, any>;
}

interface AnomalyResult {
  isAnomaly: boolean;
  anomalyScore: number;
  severity: 'low' | 'medium' | 'high';
  reason?: string;
}

export class AnomalyDetectionEngine {
  private static thresholds = {
    login: 2.5,
    transaction: 2.0,
    api_call: 3.0,
    data_access: 2.5,
  };

  // Detect anomalies using statistical analysis
  static async detectAnomaly(input: AnomalyInput): Promise<AnomalyResult> {
    try {
      let anomalyScore = 0;
      let isAnomaly = false;
      let severity: 'low' | 'medium' | 'high' = 'low';
      let reason: string | undefined;

      // Statistical analysis
      const mean = this.getMean(input.eventType);
      const stdDev = this.getStdDev(input.eventType);

      // Z-score calculation
      const zScore = Math.abs((input.value - mean) / stdDev);
      anomalyScore = Math.min(zScore / 5, 1); // Normalize to 0-1

      const threshold = this.thresholds[input.eventType as keyof typeof this.thresholds];

      if (zScore > threshold) {
        isAnomaly = true;
        severity = zScore > threshold * 2 ? 'high' : 'medium';
        reason = `Z-score: ${zScore.toFixed(2)}, Threshold: ${threshold}`;
      }

      if (isAnomaly) {
        logger.info('Anomaly detected', 'AnomalyDetectionEngine', {
          userId: input.userId,
          eventType: input.eventType,
          zScore,
          severity,
        });
      }

      return { isAnomaly, anomalyScore, severity, reason };
    } catch (error) {
      logger.error('Anomaly detection failed', error, 'AnomalyDetectionEngine');
      return { isAnomaly: false, anomalyScore: 0, severity: 'low' };
    }
  }

  // Detect unusual login patterns
  static async detectLoginAnomaly(
    userId: string,
    loginLocation: { lat: number; lng: number },
    loginTime: Date
  ): Promise<AnomalyResult> {
    try {
      const hour = loginTime.getHours();
      let anomalyScore = 0;
      let isAnomaly = false;

      // Time-based check
      if (hour < 6 || hour > 23) {
        anomalyScore += 0.3;
      }

      // Simulate location-based check
      if (Math.random() > 0.9) {
        anomalyScore += 0.4;
        isAnomaly = true;
      }

      return {
        isAnomaly,
        anomalyScore: Math.min(anomalyScore, 1),
        severity: anomalyScore > 0.6 ? 'high' : 'low',
        reason: isAnomaly ? 'Unusual login pattern detected' : undefined,
      };
    } catch (error) {
      logger.error('Login anomaly detection failed', error, 'AnomalyDetectionEngine');
      return { isAnomaly: false, anomalyScore: 0, severity: 'low' };
    }
  }

  private static getMean(eventType: string): number {
    const means: Record<string, number> = {
      login: 5,
      transaction: 50,
      api_call: 100,
      data_access: 10,
    };
    return means[eventType] || 5;
  }

  private static getStdDev(eventType: string): number {
    const stdDevs: Record<string, number> = {
      login: 2,
      transaction: 30,
      api_call: 50,
      data_access: 5,
    };
    return stdDevs[eventType] || 2;
  }
}
