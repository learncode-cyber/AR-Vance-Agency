export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'retrying'

export interface JobRecord {
  id: string
  type: string
  payload: string
  status: JobStatus
  attempts: number
  maxAttempts: number
  runAt: Date
  lockedAt: Date | null
  result: string | null
  error: string | null
  createdBy: string | null
  createdAt: Date
  completedAt: Date | null
}

/** Storage abstraction: MySQL today, Redis/BullMQ later without touching handlers. */
export interface JobStore {
  create(data: { type: string; payload: string; maxAttempts: number; runAt: Date; createdBy: string | null }): Promise<JobRecord>
  get(id: string): Promise<JobRecord | null>
  /** Oldest runnable job ids (queued/retrying with runAt <= now, or stale processing locks). */
  findRunnable(now: Date, staleBefore: Date, limit: number): Promise<string[]>
  /** Atomically claim a job; returns the claimed record or null if someone else got it. */
  claim(id: string, now: Date, staleBefore: Date): Promise<JobRecord | null>
  update(id: string, data: Partial<Pick<JobRecord, 'status' | 'runAt' | 'lockedAt' | 'result' | 'error' | 'completedAt'>>): Promise<void>
}

export type JobHandler = (payload: any, ctx: { jobId: string; attempt: number; createdBy: string | null }) => Promise<unknown>
