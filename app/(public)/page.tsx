import type { Metadata } from 'next'
import Link from 'next/link'
import { getSettings } from '@/lib/settings'
import { getActiveServices, getActivePortfolio, getActiveTestimonials, getStats } from '@/lib/data'
import ScrollReveal from '@/components/ui/ScrollReveal'

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  return { title: s.seoDefaultTitle, description: s.seoDefaultDesc }
}

const Arr = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
const SvcArr = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>

export default async function HomePage() {
  const [settings, services, portfolio, testimonials, stats] = await Promise.all([
    getSettings(),
    getActiveServices(),
    getActivePortfolio(),
    getActiveTestimonials(),
    getStats(),
  ])

  return (
    <main>
      {/* ── HERO ── */}
      <section className="hero" aria-label="Hero">
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-a" /><div className="hero-orb hero-orb-b" /><div className="hero-orb hero-orb-c" />
        <div className="hero-inner">
          <div className="hero-badge"><span className="hero-badge-dot" />{settings.heroBadge}</div>
          <h1 className="hero-title">
            {settings.heroTitle}<br />
            <span className="gradient-text">{settings.heroTitleAccent}</span>
          </h1>
          <p className="hero-sub">{settings.heroSubtitle}</p>
          <div className="hero-actions">
            <Link href="/contact" className="btn btn-primary btn-lg">{settings.heroCtaPrimary} <Arr /></Link>
            <Link href="/services" className="btn btn-outline btn-lg">{settings.heroCtaSecondary}</Link>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      {stats.length > 0 && (
        <section className="stats-section" aria-label="Key statistics">
          <ScrollReveal className="stats-grid">
            {stats.map(s => (
              <div key={s.id} className="stat-item">
                <p className="stat-val">{s.value}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </ScrollReveal>
        </section>
      )}

      {/* ── SERVICES ── */}
      <section className="section-py" style={{ background: 'var(--surface)' }} aria-label="Our services">
        <div className="container">
          <div className="sec-hd">
            <span className="sec-tag">What We Do</span>
            <h2 className="sec-title">Our Expert Services</h2>
            <p className="sec-sub">Everything your brand needs to grow, rank, and convert.</p>
          </div>
          {services.length > 0 ? (
            <ScrollReveal className="services-grid">
              {services.map(svc => (
                <div key={svc.id} className="service-card">
                  <div className="svc-icon">{svc.emoji}</div>
                  <h3 className="svc-title">{svc.title}</h3>
                  <p className="svc-desc">{svc.shortDesc}</p>
                  <Link href="/services" className="svc-link">Explore Service <SvcArr /></Link>
                </div>
              ))}
            </ScrollReveal>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--muted)' }}>Services coming soon.</p>
          )}
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link href="/services" className="btn btn-outline">View All Services <Arr /></Link>
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO ── */}
      {portfolio.length > 0 && (
        <section className="section-py" aria-label="Featured projects">
          <div className="container">
            <div className="sec-hd">
              <span className="sec-tag">Recent Work</span>
              <h2 className="sec-title">Featured Projects</h2>
            </div>
            <ScrollReveal className="portfolio-grid">
              {portfolio.slice(0, 3).map(p => (
                <div key={p.id} className="portfolio-card">
                  <div className="portfolio-img">
                    {p.image ? <img src={p.image} alt={p.title} /> : <span style={{ fontSize: '2.5rem' }}>{p.emoji}</span>}
                  </div>
                  <div className="portfolio-body">
                    <div className="portfolio-tags">{p.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
                    <h3 className="portfolio-title">{p.title}</h3>
                    <p className="portfolio-desc">{p.shortDesc}</p>
                    <p className="portfolio-result">📈 {p.result}</p>
                    <Link href="/portfolio" className="portfolio-link">View Case Study <SvcArr /></Link>
                  </div>
                </div>
              ))}
            </ScrollReveal>
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <Link href="/portfolio" className="btn btn-outline">View All Projects <Arr /></Link>
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      {testimonials.length > 0 && (
        <section className="section-py" style={{ background: 'var(--surface)' }} aria-label="Client testimonials">
          <div className="container">
            <div className="sec-hd">
              <span className="sec-tag">Client Stories</span>
              <h2 className="sec-title">What Our Clients Say</h2>
            </div>
            <ScrollReveal className="testimonials-grid">
              {testimonials.map(t => (
                <div key={t.id} className="testimonial-card">
                  <div className="testimonial-stars">{'★'.repeat(t.rating)}</div>
                  <p className="testimonial-text">{t.text}</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">{t.image ? <img src={t.image} alt={t.name} /> : t.initials}</div>
                    <div>
                      <p className="testimonial-name">{t.name}</p>
                      <p className="testimonial-role">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="cta-section" aria-label="Call to action">
        <div className="cta-inner">
          <h2 className="cta-title">{settings.ctaTitle}</h2>
          <p className="cta-sub">{settings.ctaSubtitle}</p>
          <Link href="/contact" className="btn btn-primary btn-lg">{settings.ctaButton} <Arr /></Link>
        </div>
      </section>
    </main>
  )
}
