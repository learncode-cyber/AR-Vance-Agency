import type { Metadata } from 'next'
import Link from 'next/link'
import { getActiveTeam } from '@/lib/data'
import { getSettings } from '@/lib/settings'
import ScrollReveal from '@/components/ui/ScrollReveal'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'A digital agency serving global clients with SEO, marketing, and development expertise. Meet the team behind AR Vance Agency.',
}

const VALUES = [
  { num: '01', title: 'Results First',        desc: 'We measure success by your KPIs — not vanity metrics. Every strategy is tied to outcomes that matter to your bottom line.' },
  { num: '02', title: 'Radical Transparency', desc: "You always know what we're doing, why, and what it's producing. No hidden fees, no jargon, no surprises." },
  { num: '03', title: 'Long-Term Thinking',   desc: 'We build sustainable growth engines, not quick hacks. Our strategies are designed to compound in value over time.' },
  { num: '04', title: 'Genuine Partnership',  desc: 'We treat your business as if it were our own. Your wins are our wins — and we invest the same energy into everything we deliver.' },
]

export default async function AboutPage() {
  const [team, settings] = await Promise.all([getActiveTeam(), getSettings()])

  return (
    <main>
      <section className="page-banner">
        <div className="page-banner-inner container">
          <span className="sec-tag">Our Story</span>
          <h1 className="page-banner-title" style={{ marginTop: '.75rem' }}>Built for Growth. Driven by Results.</h1>
          <p className="page-banner-sub">A dedicated digital agency serving ambitious brands since {settings.founded}.</p>
        </div>
      </section>

      {/* Mission */}
      <section className="section-py" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <ScrollReveal className="mission-grid">
            <div className="mission-visual">🌍</div>
            <div>
              <span className="sec-tag">Our Mission</span>
              <h2 style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontSize: 'clamp(1.75rem,3vw,2.25rem)', fontWeight: 800, color: 'var(--fg)', letterSpacing: '-.3px', margin: '1rem 0' }}>
                We make digital growth accessible to every ambitious business
              </h2>
              <p style={{ fontSize: '.93rem', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '1rem' }}>
                {settings.siteName} was founded in {settings.founded} with a simple belief: great digital marketing shouldn't be reserved for enterprise budgets.
              </p>
              <p style={{ fontSize: '.93rem', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '1.5rem' }}>
                Today we work with funded startups, established SMEs, and growing e-commerce brands — helping each one dominate their market online through strategy, creativity, and relentless execution.
              </p>
              {settings.parentBrandName && (
                <p style={{ fontSize: '.93rem', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '1.5rem' }}>
                  {settings.siteName} is {settings.parentBrandRelationship?.toLowerCase().startsWith('a') ? settings.parentBrandRelationship : `a digital & technology company by ${settings.parentBrandName}`},
                  a technology-focused company building and operating digital businesses, software products,
                  and online platforms. Learn more at{' '}
                  <a href={settings.parentBrandUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-mid)' }}>
                    {settings.parentBrandName}
                  </a>.
                </p>
              )}
              <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                <Link href="/services" className="btn btn-primary">Our Services →</Link>
                <Link href="/contact"  className="btn btn-outline">Work With Us</Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Team */}
      <section className="section-py">
        <div className="container">
          <div className="sec-hd">
            <span className="sec-tag">The Team</span>
            <h2 className="sec-title">Meet the Experts</h2>
            <p className="sec-sub">A small, senior team with big ambitions and zero tolerance for average.</p>
          </div>
          {team.length > 0 ? (
            <ScrollReveal className="team-grid">
              {team.map(m => (
                <div key={m.id} className="team-card">
                  <div className="team-photo">
                    {m.image ? <img src={m.image} alt={m.name} /> : m.emoji}
                  </div>
                  <div className="team-body">
                    <p className="team-name">{m.name}</p>
                    <p className="team-role">{m.role}</p>
                    <p style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '.85rem' }}>{m.bio}</p>
                    <div className="team-socials">
                      {m.linkedin && <a href={m.linkedin} className="team-social" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">in</a>}
                      {m.twitter  && <a href={m.twitter}  className="team-social" target="_blank" rel="noopener noreferrer" aria-label="Twitter">𝕏</a>}
                    </div>
                  </div>
                </div>
              ))}
            </ScrollReveal>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--muted)' }}>Team profiles will appear here once added from the admin panel.</p>
          )}
        </div>
      </section>

      {/* Values */}
      <section className="section-py" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <div className="sec-hd">
            <span className="sec-tag">What We Stand For</span>
            <h2 className="sec-title">Our Core Values</h2>
          </div>
          <ScrollReveal className="values-grid">
            {VALUES.map(v => (
              <div key={v.num} className="value-card">
                <div className="value-num">{v.num}</div>
                <h3 className="value-title">{v.title}</h3>
                <p className="value-desc">{v.desc}</p>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">Want to Work With Us?</h2>
          <p className="cta-sub">We're selective — we only take on clients we know we can genuinely help.</p>
          <Link href="/contact" className="btn btn-primary btn-lg">Start a Conversation →</Link>
        </div>
      </section>
    </main>
  )
}
