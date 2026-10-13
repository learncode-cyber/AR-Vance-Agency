import type { Metadata } from 'next'
import { getSettings } from '@/lib/settings'
import ContactForm from '@/components/ui/ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us — Get a Free Consultation',
  description: 'Get in touch. Free strategy calls for SEO, digital marketing, paid advertising, analytics and WordPress development.',
}

function MailIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> }
function PhoneIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> }
function MapIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> }

export default async function ContactPage() {
  const s = await getSettings()

  return (
    <main>
      <section className="page-banner">
        <div className="page-banner-inner container">
          <span className="sec-tag">Let's Talk</span>
          <h1 className="page-banner-title" style={{ marginTop: '.75rem' }}>Get in Touch</h1>
          <p className="page-banner-sub">Tell us about your project. We'll get back within 1 business day.</p>
        </div>
      </section>

      <section className="section-py" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2 style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--fg)', marginBottom: '1.5rem' }}>
                Contact Information
              </h2>

              <div className="contact-info-item">
                <div className="contact-icon"><MailIcon /></div>
                <div>
                  <p className="contact-label">Email</p>
                  <a href={`mailto:${s.contactEmail}`} className="contact-val">{s.contactEmail}</a>
                </div>
              </div>

              {s.contactPhone && (
                <div className="contact-info-item">
                  <div className="contact-icon"><PhoneIcon /></div>
                  <div>
                    <p className="contact-label">Phone</p>
                    <a href={`tel:${s.contactPhone}`} className="contact-val">{s.contactPhone}</a>
                  </div>
                </div>
              )}

              {s.address && (
                <div className="contact-info-item">
                  <div className="contact-icon"><MapIcon /></div>
                  <div>
                    <p className="contact-label">Location</p>
                    <p className="contact-val">{s.address}</p>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '1.5rem' }}>
                <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginBottom: '1rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase' }}>Follow Us</p>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                  {[['LinkedIn', s.socialLinkedin], ['Twitter', s.socialTwitter], ['Facebook', s.socialFacebook]].filter(([, url]) => url).map(([label, url]) => (
                    <a key={label as string} href={url as string} target="_blank" rel="noopener noreferrer" style={{ padding: '.35rem .85rem', borderRadius: 8, border: '1px solid var(--border)', fontSize: '.78rem', color: 'var(--muted)' }}>{label}</a>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--fg)', marginBottom: '1.5rem' }}>
                Send Us a Message
              </h2>
              <ContactForm
                metaPixelId={s.metaPixelId}
                googleAdsConversionId={s.googleAdsConversionId}
                googleAdsConversionLabel={s.googleAdsConversionLabel}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
