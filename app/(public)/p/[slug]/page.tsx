import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { blocksSchema } from '@/lib/page-blocks'
import PageBlocks from '@/components/PageBlocks'

export const dynamic = 'force-dynamic'

// Public URL for any page a marketer creates in the admin panel. Only published pages are shown.
async function load(slug: string) {
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return null
  const page = await prisma.page.findUnique({ where: { slug } }).catch(() => null)
  if (!page || page.status !== 'published') return null
  let raw: unknown = []
  try { raw = JSON.parse(page.blocks || '[]') } catch { raw = [] }
  const parsed = blocksSchema.safeParse(raw)
  return { page, blocks: parsed.success ? parsed.data : [] }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const r = await load(slug)
  if (!r) return { title: 'Page not found', robots: { index: false, follow: false } }
  return {
    title: r.page.seoTitle || r.page.title,
    description: r.page.seoDescription || r.page.description || undefined,
    alternates: { canonical: `/p/${r.page.slug}` },
    openGraph: { title: r.page.seoTitle || r.page.title, images: r.page.ogImage ? [r.page.ogImage] : undefined },
  }
}

export default async function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const r = await load(slug)
  if (!r) notFound()
  return <main><PageBlocks blocks={r.blocks} /></main>
}
