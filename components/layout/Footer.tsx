import Link from 'next/link'
import { getSettings } from '@/lib/settings'

export default async function Footer() {
  const s = await getSettings()

  const SERVICES = ['SEO','Digital Marketing','Paid Advertising','Analytics','WordPress Dev','AI & Automation']
  const PAGES: [string, string][] = [
    ['/', 'Home'], ['/services','Services'], ['/portfolio','Portfolio'],
    ['/about','About'], ['/blog','Blog'], ['/contact','Contact'],
  ]

  return (
    <footer className="footer">
      <div className="footer-inner">

        <div className="footer-brand">
          <div className="footer-logo">Digital<span>Arch</span></div>
          <p>{s.tagline}</p>
          {s.parentBrandName && (
            <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.38)', marginTop: '.6rem' }}>
              {s.parentBrandRelationship || `by ${s.parentBrandName}`}
            </p>
          )}
        </div>

        <div>
          <p className="footer-col-title">Navigation</p>
          <ul className="footer-nav">
            {PAGES.map(([href, label]) => (
              <li key={href}><Link href={href}>{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <p className="footer-col-title">Services</p>
          <ul className="footer-nav">
            {SERVICES.map(sv => (
              <li key={sv}><Link href="/services">{sv}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <p className="footer-col-title">Contact</p>
          <ul className="footer-nav">
            <li><a href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a></li>
            <li><a href={`tel:${s.contactPhone}`}>{s.contactPhone}</a></li>
            <li><span style={{ color: 'rgba(255,255,255,.4)' }}>{s.address}</span></li>
            <li><Link href="/contact">Send a Message →</Link></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <p className="footer-copy">
          © {new Date().getFullYear()} <Link href="/">{s.siteName}</Link>. All rights reserved.
          {s.parentBrandName && s.parentBrandUrl && (
            <>
              {' — '}
              <a href={s.parentBrandUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,.45)' }}>
                {s.parentBrandRelationship || `A Digital & Technology Company by ${s.parentBrandName}`}
              </a>
            </>
          )}
        </p>
        <div className="footer-socials">
          {s.socialLinkedin  && <a href={s.socialLinkedin}  className="footer-social" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">in</a>}
          {s.socialTwitter   && <a href={s.socialTwitter}   className="footer-social" target="_blank" rel="noopener noreferrer" aria-label="Twitter">𝕏</a>}
          {s.socialFacebook  && <a href={s.socialFacebook}  className="footer-social" target="_blank" rel="noopener noreferrer" aria-label="Facebook">f</a>}
          {s.socialInstagram && <a href={s.socialInstagram} className="footer-social" target="_blank" rel="noopener noreferrer" aria-label="Instagram">ig</a>}
        </div>
      </div>
    </footer>
  )
}
