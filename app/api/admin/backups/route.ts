import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createBackupSchema = z.object({
  backupType: z.enum(['full', 'incremental', 'differential']),
  scope: z.enum(['database', 'files', 'all']),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  try {
    const [backups, total] = await Promise.all([
      prisma.dataBackup.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.dataBackup.count(),
    ])

    return NextResponse.json({
      data: backups,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch backups' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createBackupSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const backup = await prisma.dataBackup.create({
      data: {
        name: `${parsed.data.backupType}-${parsed.data.scope}-${new Date().toISOString()}`,
        backupType: parsed.data.backupType,
        scope: parsed.data.scope,
        storagePath: `/backups/${parsed.data.backupType}/${Date.now()}`,
        storageProvider: 's3',
        status: 'pending',
      },
    })

    return NextResponse.json({ data: backup }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 })
  }
}
