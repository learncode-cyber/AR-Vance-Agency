import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiScope } from '@/lib/external-api-auth'

export async function GET(req: Request) {
  const auth = await requireApiScope(req, 'blog:read')
  if (auth instanceof NextResponse) return auth

  const posts = await prisma.blogPost.findMany({ orderBy: { publishedAt: 'desc' } })
  return NextResponse.json({ data: posts, meta: { count: posts.length, authenticated_as: auth.name }, errors: null })
}
