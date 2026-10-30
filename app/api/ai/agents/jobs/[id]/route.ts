import { NextResponse } from 'next/server'
import { auth } from '@/lib/ai-session'
import { withApi } from '@/lib/api-handler'
import { AuthenticationError, NotFoundError } from '@/lib/errors'
import { getJob } from '@/lib/jobs/queue'

// Poll a queued agent run. Users can only see their own jobs.
export const GET = withApi<{ params: Promise<{ id: string }> }>(async (_req, ctx) => {
  const session = await auth()
  if (!session) throw new AuthenticationError()
  const { id } = await ctx.params
  const job = await getJob(id)
  if (!job || job.createdBy !== session.user.id) throw new NotFoundError('Job') // same 404 for other users' jobs
  return NextResponse.json({
    data: {
      id: job.id, status: job.status, attempts: job.attempts, maxAttempts: job.maxAttempts,
      result: job.status === 'completed' && job.result ? JSON.parse(job.result) : null,
      error: job.status === 'failed' ? 'The job failed. Check the AI task log.' : null,
      createdAt: job.createdAt, completedAt: job.completedAt,
    },
  })
})
