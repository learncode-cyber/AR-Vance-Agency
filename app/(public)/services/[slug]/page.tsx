import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { toArr } from '@/lib/data'

export const dynamic = 'force-dynamic'

async function load(slug: string) {
  if (!/^[a-z0-9-]{2,120}$/.test(slug)) return null
  const s = await prisma.service.findFirst({ where: { slug, active: true } }).catch(() => null)
  return s ? { ...s, features: toArr(s.features) as string[] } : null
}

// One real page per service: its own title, description, features and a booking CTA.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const s = await load(slug)
  if (!s) return { title: 'Service not found', robots: { index: false, follow: false } }
  return {
    title: s.seoTitle || `${s.title} | AR Vance Agency`,
    description: s.seoDesc || s.shortDesc,
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: { title: s.title, description: s.shortDesc, type: 'website' },
  }
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const s = await load(slug)
  if (!s) notFound()
  return (
    <main className="section-py">
      <div className="container" style={{ maxWidth: 860 }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: '.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          <Link href="/services">Services</Link> / <span>{s.title}</span>
        </nav>
        <h1 className="page-banner-title">{s.emoji} {s.title}</h1>
        <p style={{ fontSize: '1.15rem', margin: '1rem 0 2rem', color: 'var(--text-muted)' }}>{s.shortDesc}</p>
        <div style={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>{s.longDesc}</div>
        {s.features.length > 0 && (
          <>
            <h2 style={{ marginTop: '2.5rem' }}>What is included</h2>
            <ul style={{ lineHeight: 2, paddingLeft: '1.25rem' }}>{s.features.map((f) => <li key={f}>{f}</li>)}</ul>
          </>
        )}
        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link className="btn btn-primary btn-lg" href={`/contact?service=${encodeURIComponent(s.slug)}`}>Get a quote</Link>
          <Link className="btn btn-lg" href="/booking">Book a strategy call</Link>
        </div>
      </div>
    </main>
  )
}
