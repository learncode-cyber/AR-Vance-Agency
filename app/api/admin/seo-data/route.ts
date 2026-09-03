import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const updateSEOSchema = z.object({
  pageId: z.string(),
  title: z.string(),
  description: z.string(),
  keywords: z.array(z.string()).optional(),
  ogImage: z.string().optional(),
  canonical: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const pageId = url.searchParams.get('pageId')

  if (!pageId) {
    return NextResponse.json({ error: 'pageId required' }, { status: 400 })
  }

  try {
    const seoData = await prisma.sEOData.findFirst({
      where: { pageId },
    })

    return NextResponse.json({ data: seoData })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch SEO data' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = updateSEOSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    let seoData = await prisma.sEOData.findFirst({
      where: { pageId: parsed.data.pageId },
    })

    if (seoData) {
      seoData = await prisma.sEOData.update({
        where: { id: seoData.id },
        data: {
          title: parsed.data.title,
          description: parsed.data.description,
          keywords: JSON.stringify(parsed.data.keywords || []),
          ogImage: parsed.data.ogImage || '',
          canonical: parsed.data.canonical || '',
        },
      })
    } else {
      seoData = await prisma.sEOData.create({
        data: {
          pageId: parsed.data.pageId,
          title: parsed.data.title,
          description: parsed.data.description,
          keywords: JSON.stringify(parsed.data.keywords || []),
          ogImage: parsed.data.ogImage || '',
          canonical: parsed.data.canonical || '',
        },
      })
    }

    return NextResponse.json({ data: seoData }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save SEO data' }, { status: 500 })
  }
}
