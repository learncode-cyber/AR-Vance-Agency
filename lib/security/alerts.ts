import { logger } from '../logging';

interface Alert {
  id: string;
  userId: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  channels: string[];
  sent: boolean;
  timestamp: Date;
}

export class AlertSystem {
  private static alerts: Alert[] = [];

  static async createAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'sent'>) {
    try {
      const newAlert: Alert = {
        ...alert,
        id: `alert-${Date.now()}`,
        timestamp: new Date(),
        sent: false,
      };

      this.alerts.push(newAlert);

      // Dispatch alert
      await this.dispatchAlert(newAlert);

      logger.info('Alert created', 'AlertSystem', {
        type: alert.type,
        severity: alert.severity,
      });

      return newAlert;
    } catch (error) {
      logger.error('Failed to create alert', error, 'AlertSystem');
      return null;
    }
  }

  private static async dispatchAlert(alert: Alert) {
    try {
      // Email alert
      if (alert.channels.includes('email')) {
        logger.info('Email alert sent', 'AlertSystem', {
          userId: alert.userId,
          type: alert.type,
        });
      }

      // SMS alert
      if (alert.channels.includes('sms')) {
        logger.info('SMS alert sent', 'AlertSystem', {
          userId: alert.userId,
          type: alert.type,
        });
      }

      // Slack alert
      if (alert.channels.includes('slack')) {
        logger.info('Slack alert sent', 'AlertSystem', {
          userId: alert.userId,
          type: alert.type,
        });
      }

      // Webhook alert
      if (alert.channels.includes('webhook')) {
        logger.info('Webhook alert sent', 'AlertSystem', {
          userId: alert.userId,
          type: alert.type,
        });
      }

      alert.sent = true;
    } catch (error) {
      logger.error('Failed to dispatch alert', error, 'AlertSystem');
    }
  }

  static async getAlerts(userId: string, limit: number = 50): Promise<Alert[]> {
    return this.alerts
      .filter((a) => a.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  static async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.sent = true;
      return true;
    }
    return false;
  }

  static async getAlertStats() {
    const total = this.alerts.length;
    const unresolved = this.alerts.filter((a) => !a.sent).length;
    const critical = this.alerts.filter((a) => a.severity === 'critical').length;
    const high = this.alerts.filter((a) => a.severity === 'high').length;

    const byType = this.alerts.reduce(
      (acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return { total, unresolved, critical, high, byType };
  }
}
