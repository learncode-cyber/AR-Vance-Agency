import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApi } from '@/lib/api-handler'
import { RateLimitError, ValidationError } from '@/lib/errors'
import { rateLimit } from '@/lib/rate-limit'
import { normalizeQuery, searchSite } from '@/lib/search'

const bodySchema = z.object({
  query: z.string().max(200),
  types: z.array(z.enum(['post', 'service', 'portfolio'])).max(3).optional(),
  limit: z.number().int().min(1).max(20).default(10),
})

// Public site search (was a stub that always returned zero results).
export const POST = withApi(async (req) => {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'search', 60, 60)).success) throw new RateLimitError(60)

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) throw new ValidationError('Invalid search request')
  const q = normalizeQuery(parsed.data.query)
  if (!q) throw new ValidationError('Search query must be 2–100 characters')

  const res = await searchSite({ q, types: parsed.data.types, limit: parsed.data.limit })
  return NextResponse.json({ total: res.total, results: res.hits, took: res.tookMs, provider: res.provider })
})
