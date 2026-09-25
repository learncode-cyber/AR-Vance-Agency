import type { Metadata } from 'next'
import Link from 'next/link'
import { getActiveServices } from '@/lib/data'
import ScrollReveal from '@/components/ui/ScrollReveal'

export const metadata: Metadata = {
  title: 'Our Services',
  description: 'SEO, digital marketing, paid advertising, analytics, WordPress development and AI automation services for global businesses.',
}

const PROCESS = [
  { num: '01', title: 'Discovery', desc: 'We learn your business, goals, audience, and competitive landscape in detail.' },
  { num: '02', title: 'Strategy',  desc: 'A custom roadmap with clear milestones, KPIs, and accountabilities.' },
  { num: '03', title: 'Execution', desc: 'Our specialists implement with precision and relentless attention to detail.' },
  { num: '04', title: 'Growth',    desc: 'Continuous optimisation, transparent reporting, and compounding results.' },
]

export default async function ServicesPage() {
  const services = await getActiveServices()

  return (
    <main>
      <section className="page-banner">
        <div className="page-banner-inner container">
          <span className="sec-tag">What We Offer</span>
          <h1 className="page-banner-title" style={{ marginTop: '.75rem' }}>Our Expert Services</h1>
          <p className="page-banner-sub">Every service is tailored, measurable, and built around your specific growth goals.</p>
        </div>
      </section>

      <section className="section-py" style={{ background: 'var(--surface)' }}>
        <div className="container">
          {services.length > 0 ? (
            <ScrollReveal className="services-grid">
              {services.map(svc => (
                <div key={svc.id} id={svc.slug} className="service-card">
                  <div className="svc-icon">{svc.emoji}</div>
                  <h2 className="svc-title">{svc.title}</h2>
                  <p className="svc-desc">{svc.longDesc}</p>
                  {svc.features.length > 0 && (
                    <ul className="svc-features">
                      {svc.features.map(f => <li key={f}>{f}</li>)}
                    </ul>
                  )}
                  <Link href="/contact" className="svc-link">
                    Get a Quote
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </Link>
                </div>
              ))}
            </ScrollReveal>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--muted)' }}>Services will appear here once added from the admin panel.</p>
          )}
        </div>
      </section>

      <section className="section-py">
        <div className="container">
          <div className="sec-hd">
            <span className="sec-tag">How We Work</span>
            <h2 className="sec-title">Our 4-Step Process</h2>
          </div>
          <ScrollReveal className="process-grid">
            {PROCESS.map(p => (
              <div key={p.num} className="process-step">
                <div className="process-num">{p.num}</div>
                <h3 className="process-title">{p.title}</h3>
                <p className="process-desc">{p.desc}</p>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">Not Sure Where to Start?</h2>
          <p className="cta-sub">Book a free 30-minute strategy call and we'll show you exactly where the biggest opportunities are.</p>
          <Link href="/contact" className="btn btn-primary btn-lg">Book Free Strategy Call →</Link>
        </div>
      </section>
    </main>
  )
}
