import { logger } from '../logging';

interface ScheduledJob {
  id: string;
  name: string;
  expression: string;
  type: 'cron' | 'interval' | 'once';
  nextRun: Date;
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
}

export class SchedulerService {
  private static jobs = new Map<string, ScheduledJob>();

  static async scheduleJob(data: {
    name: string;
    expression: string;
    type: 'cron' | 'interval' | 'once';
  }): Promise<ScheduledJob | null> {
    try {
      const job: ScheduledJob = {
        id: `job-${Date.now()}`,
        name: data.name,
        expression: data.expression,
        type: data.type,
        nextRun: new Date(),
        status: 'active',
        createdAt: new Date(),
      };

      this.jobs.set(job.id, job);
      logger.info('Job scheduled', 'SchedulerService', { jobId: job.id, name: data.name });
      return job;
    } catch (error) {
      logger.error('Failed to schedule job', error, 'SchedulerService');
      return null;
    }
  }

  static async getJob(jobId: string): Promise<ScheduledJob | null> {
    return this.jobs.get(jobId) || null;
  }

  static async pauseJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    job.status = 'paused';
    logger.info('Job paused', 'SchedulerService', { jobId });
    return true;
  }

  static async resumeJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    job.status = 'active';
    logger.info('Job resumed', 'SchedulerService', { jobId });
    return true;
  }

  static async executeJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'active') return false;
    
    logger.info('Job executed', 'SchedulerService', { jobId });
    return true;
  }

  static getAllJobs(): ScheduledJob[] {
    return Array.from(this.jobs.values());
  }
}
