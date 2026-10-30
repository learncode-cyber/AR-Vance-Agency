import { logger } from '../logging';

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  lastRun?: Date;
  nextRun: Date;
  successCount: number;
  failureCount: number;
  isActive: boolean;
}

export class CronService {
  private static jobs = new Map<string, CronJob>();

  static async createCronJob(data: {
    name: string;
    schedule: string;
  }): Promise<CronJob | null> {
    try {
      const cronJob: CronJob = {
        id: `cron-${Date.now()}`,
        name: data.name,
        schedule: data.schedule,
        nextRun: new Date(Date.now() + 60000),
        successCount: 0,
        failureCount: 0,
        isActive: true,
      };

      this.jobs.set(cronJob.id, cronJob);
      logger.info('Cron job created', 'CronService', { jobId: cronJob.id, schedule: data.schedule });
      return cronJob;
    } catch (error) {
      logger.error('Failed to create cron job', error, 'CronService');
      return null;
    }
  }

  static async getCronJob(jobId: string): Promise<CronJob | null> {
    return this.jobs.get(jobId) || null;
  }

  static async recordSuccess(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    job.lastRun = new Date();
    job.successCount++;
    return true;
  }

  static async recordFailure(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    job.lastRun = new Date();
    job.failureCount++;
    return true;
  }

  static getAllCronJobs(): CronJob[] {
    return Array.from(this.jobs.values());
  }
}
