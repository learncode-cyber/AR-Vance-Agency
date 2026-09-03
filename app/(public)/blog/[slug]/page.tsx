import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBlogPostBySlug, getActiveBlogPosts } from '@/lib/data'

export const revalidate = 3600

export async function generateStaticParams() {
  const posts = await getActiveBlogPosts()
  return posts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.seoTitle || post.title,
    description: post.seoDesc || post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: 'article', publishedTime: post.publishedAt.toISOString() },
  }
}

function renderContent(text: string) {
  return text.split('\n\n').map((block, i) => {
    if (block.startsWith('## '))  return <h2 key={i}>{block.slice(3)}</h2>
    if (block.startsWith('### ')) return <h3 key={i}>{block.slice(4)}</h3>
    if (block.startsWith('- ')) {
      const items = block.split('\n').map(l => l.replace(/^-\s*/, ''))
      return <ul key={i}>{items.map((it, j) => <li key={j}>{it}</li>)}</ul>
    }
    return <p key={i}>{block}</p>
  })
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post || !post.active) notFound()

  const allPosts = await getActiveBlogPosts()
  const related  = allPosts.filter(p => p.slug !== slug && p.category === post.category).slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt.toISOString(),
    author: { '@type': 'Person', name: post.author },
  }

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="article-container">
        <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontSize: '.82rem', color: 'var(--muted)', marginBottom: '2rem' }}>
          ← Back to Blog
        </Link>

        <header className="article-header">
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <span className="blog-cat">{post.category}</span>
            {post.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontSize: 'clamp(1.75rem,4vw,2.75rem)', fontWeight: 800, color: 'var(--fg)', lineHeight: 1.15, letterSpacing: '-.5px', marginBottom: '1rem' }}>
            {post.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
              <div className="testimonial-avatar" style={{ width: 36, height: 36, fontSize: '.8rem' }}>
                {post.author.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--fg)' }}>{post.author}</p>
                <p style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{post.authorRole}</p>
              </div>
            </div>
            <span style={{ color: 'var(--border)', fontSize: '1.2rem' }}>|</span>
            <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
              {new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>· {post.readTime}</span>
          </div>

          {post.image && (
            <img src={post.image} alt={post.title} style={{ width: '100%', borderRadius: 12, marginTop: '1.5rem', objectFit: 'cover', maxHeight: 400 }} />
          )}
        </header>

        <div className="article-content">
          {renderContent(post.content)}
        </div>

        <div style={{ marginTop: '3rem', padding: '2rem', background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--fg)', marginBottom: '.5rem' }}>Want to implement these strategies?</p>
          <p style={{ fontSize: '.88rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>Our team does this every day. Let's talk about your project.</p>
          <Link href="/contact" className="btn btn-primary">Get a Free Consultation →</Link>
        </div>
      </article>

      {related.length > 0 && (
        <section style={{ background: 'var(--surface)', padding: '4rem 1.5rem' }}>
          <div style={{ maxWidth: 760, marginInline: 'auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--fg)', marginBottom: '2rem' }}>Related Articles</h2>
            <div className="blog-grid">
              {related.map(p => (
                <Link key={p.id} href={`/blog/${p.slug}`} style={{ textDecoration: 'none' }}>
                  <article className="blog-card">
                    <div className="blog-cover"><span style={{ fontSize: '2rem' }}>📝</span></div>
                    <div className="blog-body">
                      <div className="blog-meta"><span className="blog-cat">{p.category}</span></div>
                      <h3 className="blog-title">{p.title}</h3>
                      <p className="blog-excerpt">{p.excerpt}</p>
                      <span className="blog-link">
                        Read Article
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
