import type { JobHandler, JobRecord, JobStore } from './types'
import { withSpan } from '@/lib/telemetry'

const handlers = new Map<string, JobHandler>()
const STALE_LOCK_MS = 5 * 60_000
const BACKOFF_BASE_MS = 5_000
const MAX_RESULT_CHARS = 100_000

export function registerJobHandler(type: string, handler: JobHandler): void {
  handlers.set(type, handler)
}
export function _resetJobHandlers(): void {
  handlers.clear()
}

let defaultStore: JobStore | null = null
async function store(): Promise<JobStore> {
  if (!defaultStore) defaultStore = (await import('./prisma-store')).prismaJobStore
  return defaultStore
}

export async function enqueueJob(
  type: string,
  payload: unknown,
  opts: { maxAttempts?: number; delayMs?: number; createdBy?: string | null; store?: JobStore } = {}
): Promise<JobRecord> {
  if (!handlers.has(type)) throw new Error(`No handler registered for job type "${type}"`)
  const s = opts.store ?? (await store())
  return s.create({
    type,
    payload: JSON.stringify(payload ?? {}),
    maxAttempts: Math.min(Math.max(opts.maxAttempts ?? 3, 1), 10),
    runAt: new Date(Date.now() + (opts.delayMs ?? 0)),
    createdBy: opts.createdBy ?? null,
  })
}

export async function getJob(id: string, s?: JobStore): Promise<JobRecord | null> {
  return (s ?? (await store())).get(id)
}

/** Exponential backoff with a cap: 5s, 10s, 20s, ... max 10 min. */
export function backoffMs(attempt: number): number {
  return Math.min(BACKOFF_BASE_MS * 2 ** (attempt - 1), 10 * 60_000)
}

const safeMsg = (e: unknown) => (e instanceof Error ? e.message : String(e)).slice(0, 500)

/** Run one claimed job to completion/failure/retry. Never throws. */
async function runJob(s: JobStore, job: JobRecord): Promise<'completed' | 'retrying' | 'failed'> {
  const handler = handlers.get(job.type)
  try {
    if (!handler) throw new Error(`No handler for "${job.type}"`)
    const out = await withSpan(`job ${job.type}`, 'job', { 'job.id': job.id, 'job.type': job.type, 'job.attempt': job.attempts }, () =>
      handler(JSON.parse(job.payload), { jobId: job.id, attempt: job.attempts, createdBy: job.createdBy })
    )
    await s.update(job.id, { status: 'completed', result: JSON.stringify(out ?? null).slice(0, MAX_RESULT_CHARS), error: null, lockedAt: null, completedAt: new Date() })
    return 'completed'
  } catch (e) {
    const exhausted = job.attempts >= job.maxAttempts || !handler
    if (exhausted) {
      await s.update(job.id, { status: 'failed', error: safeMsg(e), lockedAt: null, completedAt: new Date() })
      return 'failed'
    }
    await s.update(job.id, { status: 'retrying', error: safeMsg(e), lockedAt: null, runAt: new Date(Date.now() + backoffMs(job.attempts)) })
    return 'retrying'
  }
}

export interface DrainSummary { claimed: number; completed: number; retrying: number; failed: number }

/**
 * Process up to `maxJobs` runnable jobs, stopping before `budgetMs` elapses so
 * a request/cron hit on single-app hosting never runs unbounded.
 */
export async function processJobs(opts: { maxJobs?: number; budgetMs?: number; store?: JobStore } = {}): Promise<DrainSummary> {
  const s = opts.store ?? (await store())
  const maxJobs = opts.maxJobs ?? 5
  const deadline = Date.now() + (opts.budgetMs ?? 25_000)
  const summary: DrainSummary = { claimed: 0, completed: 0, retrying: 0, failed: 0 }

  while (summary.claimed < maxJobs && Date.now() < deadline) {
    const now = new Date()
    const ids = await s.findRunnable(now, new Date(now.getTime() - STALE_LOCK_MS), 5)
    if (ids.length === 0) break
    let claimedAny = false
    for (const id of ids) {
      if (summary.claimed >= maxJobs || Date.now() >= deadline) break
      const job = await s.claim(id, now, new Date(now.getTime() - STALE_LOCK_MS))
      if (!job) continue // another runner took it
      claimedAny = true
      summary.claimed++
      summary[await runJob(s, job)]++
    }
    if (!claimedAny) break
  }
  return summary
}

/** Fire-and-forget nudge after enqueue so jobs start without waiting for cron. Errors are swallowed. */
export function kickJobs(): void {
  setTimeout(() => { processJobs({ maxJobs: 1, budgetMs: 20_000 }).catch(() => {}) }, 0)
}
