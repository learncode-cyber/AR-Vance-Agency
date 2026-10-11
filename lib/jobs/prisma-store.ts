import { prisma } from '@/lib/prisma'
import type { JobRecord, JobStore } from './types'

const toRecord = (j: any): JobRecord => j as JobRecord

export const prismaJobStore: JobStore = {
  async create(d) {
    return toRecord(await prisma.job.create({ data: { type: d.type, payload: d.payload, maxAttempts: d.maxAttempts, runAt: d.runAt, createdBy: d.createdBy } }))
  },
  async get(id) {
    const j = await prisma.job.findUnique({ where: { id } })
    return j ? toRecord(j) : null
  },
  async findRunnable(now, staleBefore, limit) {
    const rows = await prisma.job.findMany({
      where: {
        OR: [
          { status: { in: ['queued', 'retrying'] }, runAt: { lte: now } },
          { status: 'processing', lockedAt: { lt: staleBefore } }, // worker died mid-job
        ],
      },
      orderBy: { runAt: 'asc' },
      select: { id: true },
      take: limit,
    })
    return rows.map((r) => r.id)
  },
  async claim(id, now, staleBefore) {
    // Compare-and-set: only one runner can flip the row, even with parallel cron hits.
    const res = await prisma.job.updateMany({
      where: {
        id,
        OR: [
          { status: { in: ['queued', 'retrying'] }, runAt: { lte: now } },
          { status: 'processing', lockedAt: { lt: staleBefore } },
        ],
      },
      data: { status: 'processing', lockedAt: now, attempts: { increment: 1 } },
    })
    if (res.count !== 1) return null
    const j = await prisma.job.findUnique({ where: { id } })
    return j ? toRecord(j) : null
  },
  async update(id, data) {
    await prisma.job.update({ where: { id }, data })
  },
}
