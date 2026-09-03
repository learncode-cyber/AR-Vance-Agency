import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createTranslationSchema = z.object({
  languageId: z.string(),
  key: z.string(),
  namespace: z.string(),
  value: z.string(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const languageId = url.searchParams.get('languageId')
  const namespace = url.searchParams.get('namespace')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const skip = (page - 1) * limit

  const where: any = {}
  if (languageId) where.languageId = languageId
  if (namespace) where.namespace = namespace

  try {
    const [translations, total] = await Promise.all([
      prisma.translation.findMany({
        where,
        orderBy: { key: 'asc' },
        skip,
        take: limit,
      }),
      prisma.translation.count({ where }),
    ])

    return NextResponse.json({
      data: translations,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch translations' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createTranslationSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const translation = await prisma.translation.create({
      data: {
        ...parsed.data,
        translated: true,
      },
    })

    return NextResponse.json({ data: translation }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create translation' }, { status: 500 })
  }
}
