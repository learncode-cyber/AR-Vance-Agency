import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createLanguageSchema = z.object({
  name: z.string().min(2),
  code: z.string().length(2).or(z.string().length(5)),
  nativeName: z.string(),
  direction: z.enum(['ltr', 'rtl']).optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  try {
    const languages = await prisma.language.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ data: languages })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch languages' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createLanguageSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const language = await prisma.language.create({
      data: {
        ...parsed.data,
        direction: parsed.data.direction || 'ltr',
      },
    })

    return NextResponse.json({ data: language }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create language' }, { status: 500 })
  }
}
