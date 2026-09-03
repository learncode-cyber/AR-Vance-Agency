import type { Metadata } from 'next'
import Link from 'next/link'
import { getActiveBlogPosts } from '@/lib/data'
import ScrollReveal from '@/components/ui/ScrollReveal'

interface BlogPost {
  id: string; slug: string; title: string; excerpt: string; category: string
  image: string; readTime: string; publishedAt: Date; featured: boolean
}

export const metadata: Metadata = {
  title: 'Blog — SEO & Digital Marketing Insights',
  description: 'Expert guides, case studies and insights on SEO, digital marketing, paid ads, analytics, WordPress and AI automation.',
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
      <article className="blog-card">
        <div className="blog-cover">
          {post.image
            ? <img src={post.image} alt={post.title} />
            : <span style={{ fontSize: '2.5rem' }}>📝</span>
          }
        </div>
        <div className="blog-body">
          <div className="blog-meta">
            <span className="blog-cat">{post.category}</span>
            <span className="blog-date">{new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className="blog-date">· {post.readTime}</span>
          </div>
          <h2 className="blog-title">{post.title}</h2>
          <p className="blog-excerpt">{post.excerpt}</p>
          <span className="blog-link">
            Read Article
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
        </div>
      </article>
    </Link>
  )
}

export default async function BlogPage() {
  const posts    = await getActiveBlogPosts()
  const featured = posts.filter(p => p.featured)
  const rest     = posts.filter(p => !p.featured)

  return (
    <main>
      <section className="page-banner">
        <div className="page-banner-inner container">
          <span className="sec-tag">Insights & Guides</span>
          <h1 className="page-banner-title" style={{ marginTop: '.75rem' }}>The Blog</h1>
          <p className="page-banner-sub">Expert SEO, marketing, and growth content — written by practitioners, not content mills.</p>
        </div>
      </section>

      <section className="section-py" style={{ background: 'var(--surface)' }}>
        <div className="container">
          {posts.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--muted)' }}>Articles will appear here once published from the admin panel.</p>
          )}

          {featured.length > 0 && (
            <>
              <div className="sec-hd" style={{ marginBottom: '2rem' }}>
                <span className="sec-tag">Featured</span>
                <h2 className="sec-title">Top Reads</h2>
              </div>
              <ScrollReveal className="blog-grid" style={{ marginBottom: rest.length > 0 ? '4rem' : 0 }}>
                {featured.map(p => <BlogCard key={p.id} post={p} />)}
              </ScrollReveal>
            </>
          )}

          {rest.length > 0 && (
            <>
              <div className="sec-hd" style={{ marginBottom: '2rem' }}>
                <span className="sec-tag">Latest</span>
                <h2 className="sec-title">Recent Articles</h2>
              </div>
              <ScrollReveal className="blog-grid">
                {rest.map(p => <BlogCard key={p.id} post={p} />)}
              </ScrollReveal>
            </>
          )}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">Want Results Like These?</h2>
          <p className="cta-sub">These strategies work even better when implemented by specialists. Let's talk.</p>
          <Link href="/contact" className="btn btn-primary btn-lg">Get a Free Consultation →</Link>
        </div>
      </section>
    </main>
  )
}
