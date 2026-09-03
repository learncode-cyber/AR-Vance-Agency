import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createSyncSchema = z.object({
  sourceType: z.string(),
  sourceId: z.string(),
  destinationType: z.string(),
  destinationId: z.string(),
  frequency: z.string().optional(),
  fieldMapping: z.record(z.any()).optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const active = url.searchParams.get('active')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: any = {}
  if (active) where.active = active === 'true'

  try {
    const [syncs, total] = await Promise.all([
      prisma.dataSync.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.dataSync.count({ where }),
    ])

    return NextResponse.json({
      data: syncs,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data syncs' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createSyncSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const dataSync = await prisma.dataSync.create({
      data: {
        ...parsed.data,
        frequency: parsed.data.frequency || 'manual',
        fieldMapping: JSON.stringify(parsed.data.fieldMapping || {}),
        status: 'idle',
      },
    })

    return NextResponse.json({ data: dataSync }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create data sync' }, { status: 500 })
  }
}
