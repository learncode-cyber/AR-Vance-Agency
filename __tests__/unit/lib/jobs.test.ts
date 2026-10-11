/** @jest-environment node */
import { enqueueJob, processJobs, registerJobHandler, _resetJobHandlers, backoffMs } from '@/lib/jobs/queue'
import type { JobRecord, JobStore } from '@/lib/jobs/types'

function memStore(): JobStore & { rows: Map<string, JobRecord> } {
  const rows = new Map<string, JobRecord>(); let n = 0
  const runnable = (j: JobRecord, now: Date, stale: Date) =>
    (['queued', 'retrying'].includes(j.status) && j.runAt <= now) || (j.status === 'processing' && !!j.lockedAt && j.lockedAt < stale)
  return {
    rows,
    async create(d) { const j: JobRecord = { id: `j${++n}`, type: d.type, payload: d.payload, status: 'queued', attempts: 0, maxAttempts: d.maxAttempts, runAt: d.runAt, lockedAt: null, result: null, error: null, createdBy: d.createdBy, createdAt: new Date(), completedAt: null }; rows.set(j.id, j); return { ...j } },
    async get(id) { const j = rows.get(id); return j ? { ...j } : null },
    async findRunnable(now, stale, limit) { return [...rows.values()].filter((j) => runnable(j, now, stale)).sort((a, b) => +a.runAt - +b.runAt).slice(0, limit).map((j) => j.id) },
    async claim(id, now, stale) { const j = rows.get(id); if (!j || !runnable(j, now, stale)) return null; j.status = 'processing'; j.lockedAt = now; j.attempts++; return { ...j } },
    async update(id, data) { Object.assign(rows.get(id)!, data) },
  }
}

beforeEach(() => _resetJobHandlers())

describe('job queue', () => {
  it('runs a job to completion and stores the result', async () => {
    const s = memStore(); registerJobHandler('t.ok', async (p) => ({ doubled: p.n * 2 }))
    const j = await enqueueJob('t.ok', { n: 4 }, { store: s })
    expect(await processJobs({ store: s })).toMatchObject({ claimed: 1, completed: 1 })
    const done = s.rows.get(j.id)!; expect(done.status).toBe('completed'); expect(JSON.parse(done.result!)).toEqual({ doubled: 8 }); expect(done.lockedAt).toBeNull()
  })
  it('refuses to enqueue an unknown job type', async () => {
    await expect(enqueueJob('nope', {}, { store: memStore() })).rejects.toThrow(/No handler/)
  })
  it('retries with backoff, then succeeds', async () => {
    const s = memStore(); let calls = 0
    registerJobHandler('t.flaky', async () => { if (++calls < 2) throw new Error('transient'); return 'fine' })
    const j = await enqueueJob('t.flaky', {}, { store: s, maxAttempts: 3 })
    expect(await processJobs({ store: s })).toMatchObject({ retrying: 1 })
    const r = s.rows.get(j.id)!; expect(r.status).toBe('retrying'); expect(r.runAt.getTime()).toBeGreaterThan(Date.now())
    expect(await processJobs({ store: s })).toMatchObject({ claimed: 0 }) // not due yet
    r.runAt = new Date(Date.now() - 1) // time passes
    expect(await processJobs({ store: s })).toMatchObject({ completed: 1 }); expect(r.status).toBe('completed'); expect(r.attempts).toBe(2)
  })
  it('fails permanently after maxAttempts', async () => {
    const s = memStore(); registerJobHandler('t.bad', async () => { throw new Error('always') })
    const j = await enqueueJob('t.bad', {}, { store: s, maxAttempts: 2 })
    await processJobs({ store: s }); s.rows.get(j.id)!.runAt = new Date(Date.now() - 1); await processJobs({ store: s })
    const f = s.rows.get(j.id)!; expect(f.status).toBe('failed'); expect(f.error).toBe('always'); expect(f.attempts).toBe(2)
    expect(await processJobs({ store: s })).toMatchObject({ claimed: 0 })
  })
  it('recovers a stale processing lock (worker crashed) but not a fresh one', async () => {
    const s = memStore(); registerJobHandler('t.ok', async () => 'x')
    const fresh = await enqueueJob('t.ok', {}, { store: s }); const stale = await enqueueJob('t.ok', {}, { store: s })
    Object.assign(s.rows.get(fresh.id)!, { status: 'processing', lockedAt: new Date() })
    Object.assign(s.rows.get(stale.id)!, { status: 'processing', lockedAt: new Date(Date.now() - 10 * 60_000) })
    await processJobs({ store: s })
    expect(s.rows.get(stale.id)!.status).toBe('completed'); expect(s.rows.get(fresh.id)!.status).toBe('processing')
  })
  it('two runners cannot execute the same job twice', async () => {
    const s = memStore(); let runs = 0; registerJobHandler('t.once', async () => { runs++; await new Promise((r) => setTimeout(r, 20)) })
    await enqueueJob('t.once', {}, { store: s })
    await Promise.all([processJobs({ store: s }), processJobs({ store: s })])
    expect(runs).toBe(1)
  })
  it('respects maxJobs and a delayed runAt', async () => {
    const s = memStore(); registerJobHandler('t.ok', async () => 1)
    for (let i = 0; i < 4; i++) await enqueueJob('t.ok', {}, { store: s })
    await enqueueJob('t.ok', {}, { store: s, delayMs: 60_000 })
    expect(await processJobs({ store: s, maxJobs: 3 })).toMatchObject({ claimed: 3 })
    expect(await processJobs({ store: s, maxJobs: 10 })).toMatchObject({ claimed: 1 }) // delayed one stays queued
  })
  it('backoff doubles and caps', () => {
    expect([1, 2, 3].map(backoffMs)).toEqual([5000, 10000, 20000]); expect(backoffMs(30)).toBe(600000)
  })
})
