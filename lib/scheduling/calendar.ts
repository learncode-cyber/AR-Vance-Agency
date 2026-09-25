import { logger } from '../logging';

interface CalendarIntegration {
  id: string;
  provider: 'google' | 'outlook' | 'ical';
  email: string;
  accessToken?: string;
  refreshToken?: string;
  isConnected: boolean;
  lastSync?: Date;
  createdAt: Date;
}

export class CalendarService {
  private static integrations = new Map<string, CalendarIntegration>();

  static async connectCalendar(data: {
    provider: 'google' | 'outlook' | 'ical';
    email: string;
    accessToken?: string;
  }): Promise<CalendarIntegration | null> {
    try {
      const integration: CalendarIntegration = {
        id: `cal-${Date.now()}`,
        provider: data.provider,
        email: data.email,
        accessToken: data.accessToken,
        isConnected: true,
        createdAt: new Date(),
      };

      this.integrations.set(integration.id, integration);
      logger.info('Calendar connected', 'CalendarService', { provider: data.provider, email: data.email });
      return integration;
    } catch (error) {
      logger.error('Failed to connect calendar', error, 'CalendarService');
      return null;
    }
  }

  static async getIntegration(integrationId: string): Promise<CalendarIntegration | null> {
    return this.integrations.get(integrationId) || null;
  }

  static async syncCalendar(integrationId: string): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration || !integration.isConnected) return false;
    integration.lastSync = new Date();
    logger.info('Calendar synced', 'CalendarService', { integrationId });
    return true;
  }

  static getAllIntegrations(): CalendarIntegration[] {
    return Array.from(this.integrations.values());
  }
}
