import { logger } from '../logging';

interface SecurityEvent {
  id: string;
  userId: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
}

export class SecurityMonitoring {
  private static events: SecurityEvent[] = [];

  static async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>) {
    try {
      const securityEvent: SecurityEvent = {
        ...event,
        id: `event-${Date.now()}`,
        timestamp: new Date(),
        resolved: false,
      };

      this.events.push(securityEvent);

      // Keep only last 1000 events
      if (this.events.length > 1000) {
        this.events = this.events.slice(-1000);
      }

      logger.info('Security event logged', 'SecurityMonitoring', {
        eventType: event.eventType,
        severity: event.severity,
      });

      return securityEvent;
    } catch (error) {
      logger.error('Failed to log security event', error, 'SecurityMonitoring');
      return null;
    }
  }

  static async getEvents(filter?: {
    userId?: string;
    severity?: string;
    eventType?: string;
    limit?: number;
  }): Promise<SecurityEvent[]> {
    try {
      let filtered = [...this.events];

      if (filter?.userId) {
        filtered = filtered.filter((e) => e.userId === filter.userId);
      }

      if (filter?.severity) {
        filtered = filtered.filter((e) => e.severity === filter.severity);
      }

      if (filter?.eventType) {
        filtered = filtered.filter((e) => e.eventType === filter.eventType);
      }

      return filtered
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, filter?.limit || 100);
    } catch (error) {
      logger.error('Failed to get security events', error, 'SecurityMonitoring');
      return [];
    }
  }

  // Monitor login attempts
  static async monitorLoginAttempt(userId: string, success: boolean, ip: string) {
    if (!success) {
      await this.logSecurityEvent({
        userId,
        eventType: 'failed_login',
        severity: 'medium',
        details: { ip, timestamp: new Date() },
      });

      // Check for brute force
      const recentFailures = this.events.filter(
        (e) =>
          e.userId === userId &&
          e.eventType === 'failed_login' &&
          Date.now() - e.timestamp.getTime() < 15 * 60 * 1000 // Last 15 minutes
      );

      if (recentFailures.length > 5) {
        await this.logSecurityEvent({
          userId,
          eventType: 'brute_force_attempt',
          severity: 'high',
          details: { ip, attemptCount: recentFailures.length },
        });
      }
    }
  }

  // Monitor suspicious transactions
  static async monitorTransaction(
    userId: string,
    amount: number,
    fraudRisk: number
  ) {
    if (fraudRisk > 0.7) {
      await this.logSecurityEvent({
        userId,
        eventType: 'suspicious_transaction',
        severity: fraudRisk > 0.9 ? 'critical' : 'high',
        details: { amount, fraudRisk },
      });
    }
  }

  // Get security metrics
  static async getSecurityMetrics() {
    try {
      const totalEvents = this.events.length;
      const criticalEvents = this.events.filter((e) => e.severity === 'critical').length;
      const highEvents = this.events.filter((e) => e.severity === 'high').length;
      const unresolvedEvents = this.events.filter((e) => !e.resolved).length;

      const eventsByType = this.events.reduce(
        (acc, event) => {
          acc[event.eventType] = (acc[event.eventType] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        totalEvents,
        criticalEvents,
        highEvents,
        unresolvedEvents,
        eventsByType,
      };
    } catch (error) {
      logger.error('Failed to get security metrics', error, 'SecurityMonitoring');
      return {
        totalEvents: 0,
        criticalEvents: 0,
        highEvents: 0,
        unresolvedEvents: 0,
        eventsByType: {},
      };
    }
  }
}
