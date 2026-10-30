/** @jest-environment node */
const queryRaw = jest.fn()
jest.mock('@/lib/prisma', () => ({ prisma: { $queryRaw: (...a: unknown[]) => queryRaw(...a) } }))
jest.mock('next/server', () => ({ NextResponse: { json: (b: unknown, i?: { status?: number }) => new Response(JSON.stringify(b), { status: i?.status ?? 200 }) } }))
import { GET } from '@/app/api/health/route'

describe('GET /api/health', () => {
  it('200 ok when the DB answers', async () => {
    queryRaw.mockResolvedValue([{ 1: 1 }])
    const res = await GET(); const j = await res.json()
    expect(res.status).toBe(200); expect(j).toMatchObject({ status: 'ok', db: true })
  })
  it('503 degraded when the DB fails, without leaking the error', async () => {
    queryRaw.mockRejectedValue(new Error('connect ECONNREFUSED 10.1.2.3:3306 user=root'))
    const res = await GET(); const t = JSON.stringify(await res.json())
    expect(res.status).toBe(503); expect(t).toContain('degraded'); expect(t).not.toMatch(/ECONNREFUSED|10\.1\.2\.3|root/)
  })
})
