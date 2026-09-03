import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createBlockSchema = z.object({
  pageId: z.string(),
  type: z.string(),
  content: z.record(z.any()).optional(),
  position: z.number().optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const pageId = url.searchParams.get('pageId')

  const where: any = {}
  if (pageId) where.pageId = pageId

  try {
    const blocks = await prisma.contentBlock.findMany({
      where,
      orderBy: { position: 'asc' },
    })

    return NextResponse.json({ data: blocks })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blocks' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createBlockSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const block = await prisma.contentBlock.create({
      data: {
        ...parsed.data,
        content: JSON.stringify(parsed.data.content || {}),
      },
    })

    return NextResponse.json({ data: block }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create block' }, { status: 500 })
  }
}
