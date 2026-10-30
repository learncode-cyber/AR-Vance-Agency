import type { Metadata } from 'next'
import SeoAuditForm from '@/components/ui/SeoAuditForm'

export const metadata: Metadata = {
  title: 'Free Marketing Audit | AR Vance Agency',
  description: 'Get a free marketing audit of your website and campaigns. We review your visibility, messaging and conversion path and send a written report. No obligation.',
  alternates: { canonical: '/free-marketing-audit' },
}

export default function FreeMarketingAuditPage() {
  return (
    <main className="section-py">
      <div className="container" style={{ maxWidth: 640 }}>
        <span className="sec-tag">Free, no obligation</span>
        <h1 className="page-banner-title" style={{ marginTop: '.75rem' }}>Get Your Free Marketing Audit</h1>
        <p className="page-banner-sub" style={{ margin: '1rem 0 2rem' }}>
          Send us your website address. We review your search visibility, messaging, lead capture and campaigns, then send a written report with clear next steps.
        </p>
        <SeoAuditForm auditType="marketing" />
        <p style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>Need a broader review of your whole business? <a href="/free-business-audit" style={{ color: 'var(--emerald)', fontWeight: 600 }}>Request a Free Business Audit</a></p>
      </div>
    </main>
  )
}
