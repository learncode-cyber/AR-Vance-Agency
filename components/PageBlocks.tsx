import Link from 'next/link'
import type { PageBlock } from '@/lib/page-blocks'

// Renders marketer-built blocks. Plain text only: no HTML injection, paragraphs split on blank lines.
const paragraphs = (s: string) => s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
const isInternal = (h: string) => h.startsWith('/')

// Gold on dark sections (hero) so the button stands out; navy elsewhere.
function Button({ href, children, onDark = false }: { href: string; children: React.ReactNode; onDark?: boolean }) {
  if (!href) return null
  const cls = `btn btn-lg ${onDark ? 'btn-gold' : 'btn-primary'}`
  return isInternal(href)
    ? <Link href={href} className={cls}>{children}</Link>
    : <a href={href} className={cls} rel="noopener">{children}</a>
}

export default function PageBlocks({ blocks }: { blocks: PageBlock[] }) {
  return (
    <>
      {blocks.map((b) => {
        switch (b.type) {
          case 'hero':
            return (
              <section key={b.id} className="section-py" style={{ background: 'linear-gradient(135deg,var(--navy,#1a3a52),#0f2a3d)', color: '#fff' }}>
                <div className="container">
                  <h1 className="page-banner-title" style={{ color: '#fff' }}>{b.title}</h1>
                  {b.subtitle && <p style={{ color: '#cfd9e3', fontSize: '1.15rem', margin: '1rem 0 1.5rem', maxWidth: 720 }}>{b.subtitle}</p>}
                  {b.ctaText && <Button href={b.ctaHref} onDark>{b.ctaText}</Button>}
                  {b.image && <img src={b.image} alt="" style={{ marginTop: '2rem', maxWidth: '100%', borderRadius: 12 }} />}
                </div>
              </section>
            )
          case 'text':
            return (
              <section key={b.id} className="section-py">
                <div className="container" style={{ maxWidth: 820 }}>
                  {b.heading && <h2 className="sec-title" style={{ textAlign: 'left' }}>{b.heading}</h2>}
                  {paragraphs(b.body).map((p, i) => <p key={i} style={{ margin: '1rem 0', lineHeight: 1.75, color: 'var(--text-main)' }}>{p}</p>)}
                </div>
              </section>
            )
          case 'image':
            return b.src ? (
              <section key={b.id} className="section-py" style={{ paddingTop: 0 }}>
                <figure className="container" style={{ maxWidth: 1000 }}>
                  <img src={b.src} alt={b.alt} style={{ width: '100%', borderRadius: 12, display: 'block' }} />
                  {b.caption && <figcaption style={{ color: 'var(--text-muted)', marginTop: '.5rem', fontSize: '.9rem' }}>{b.caption}</figcaption>}
                </figure>
              </section>
            ) : null
          case 'cta':
            return (
              <section key={b.id} className="cta-section">
                <div className="cta-inner">
                  <h2 className="cta-title">{b.title}</h2>
                  {b.body && <p className="cta-sub">{b.body}</p>}
                  <Button href={b.buttonHref}>{b.buttonText}</Button>
                </div>
              </section>
            )
          case 'columns':
            return (
              <section key={b.id} className="section-py">
                <div className="container">
                  <div className="services-grid">
                    {b.items.map((it, i) => (
                      <div key={i} className="service-card">
                        <h3>{it.title}</h3>
                        {it.body && <p>{it.body}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )
          case 'faq':
            return (
              <section key={b.id} className="section-py">
                <div className="container" style={{ maxWidth: 820 }}>
                  {b.items.map((it, i) => (
                    <details key={i} style={{ borderBottom: '1px solid var(--border-color)', padding: '1rem 0' }}>
                      <summary style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--navy)' }}>{it.q}</summary>
                      <p style={{ marginTop: '.6rem', color: 'var(--text-main)' }}>{it.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )
        }
      })}
    </>
  )
}
