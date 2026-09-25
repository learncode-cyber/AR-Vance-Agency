import { prisma } from '@/lib/prisma'
import { aiTaskEngine } from './AITaskEngine'

export class TaskScheduler {
  async scheduleTask(
    userId: string,
    orgId: string,
    agent: string,
    input: string,
    scheduleTime: Date
  ) {
    const now = new Date()
    const delay = scheduleTime.getTime() - now.getTime()

    if (delay > 0) {
      setTimeout(() => {
        aiTaskEngine.createTask(userId, orgId, agent, input)
      }, delay)
    }

    return {
      scheduled: true,
      scheduleTime,
      delay
    }
  }

  async listScheduledTasks(orgId: string) {
    return prisma.aITask.findMany({
      where: { organizationId: orgId, status: 'queued' },
      orderBy: { createdAt: 'asc' }
    })
  }
}

export const taskScheduler = new TaskScheduler()
