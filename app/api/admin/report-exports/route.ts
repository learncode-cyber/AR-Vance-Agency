import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createExportSchema = z.object({
  reportId: z.string(),
  format: z.enum(['pdf', 'excel', 'csv', 'json']),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const reportId = url.searchParams.get('reportId')
  const status = url.searchParams.get('status')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: any = {}
  if (reportId) where.reportId = reportId
  if (status) where.status = status

  try {
    const [exports, total] = await Promise.all([
      prisma.reportExport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.reportExport.count({ where }),
    ])

    return NextResponse.json({
      data: exports,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch report exports' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createExportSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const fileName = `report-${Date.now()}.${parsed.data.format}`
    const filePath = `/exports/${fileName}`

    const exportRecord = await prisma.reportExport.create({
      data: {
        reportId: parsed.data.reportId,
        format: parsed.data.format,
        fileName,
        filePath,
        fileSize: 0,
        createdBy: session.userId,
        status: 'processing',
      },
    })

    return NextResponse.json({ data: exportRecord }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create report export' }, { status: 500 })
  }
}
