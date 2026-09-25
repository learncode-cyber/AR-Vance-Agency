import { logger } from '../logging';

interface ScheduledEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  recurring: boolean;
  recurrence?: string;
  attendees: string[];
  reminders: number[];
  timezone: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export class EventService {
  private static events = new Map<string, ScheduledEvent>();

  static async createEvent(data: {
    title: string;
    startTime: Date;
    endTime: Date;
    attendees: string[];
    timezone: string;
    recurring?: boolean;
    recurrence?: string;
  }): Promise<ScheduledEvent | null> {
    try {
      const event: ScheduledEvent = {
        id: `event-${Date.now()}`,
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        recurring: data.recurring || false,
        recurrence: data.recurrence,
        attendees: data.attendees,
        reminders: [15, 60],
        timezone: data.timezone,
        status: 'scheduled',
      };

      this.events.set(event.id, event);
      logger.info('Event created', 'EventService', { eventId: event.id, title: data.title });
      return event;
    } catch (error) {
      logger.error('Failed to create event', error, 'EventService');
      return null;
    }
  }

  static async getEvent(eventId: string): Promise<ScheduledEvent | null> {
    return this.events.get(eventId) || null;
  }

  static async completeEvent(eventId: string): Promise<boolean> {
    const event = this.events.get(eventId);
    if (!event) return false;
    event.status = 'completed';
    logger.info('Event completed', 'EventService', { eventId });
    return true;
  }

  static getAllEvents(): ScheduledEvent[] {
    return Array.from(this.events.values());
  }
}
