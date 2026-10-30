import type { Metadata } from 'next'
import SeoAuditForm from '@/components/ui/SeoAuditForm'

export const metadata: Metadata = {
  title: 'Free Business Audit | AR Vance Agency',
  description: 'Get a free business audit: a review of your digital presence, growth channels and priorities, with a written report. No obligation.',
  alternates: { canonical: '/free-business-audit' },
}

export default function FreeBusinessAuditPage() {
  return (
    <main className="section-py">
      <div className="container" style={{ maxWidth: 640 }}>
        <span className="sec-tag">Free, no obligation</span>
        <h1 className="page-banner-title" style={{ marginTop: '.75rem' }}>Get Your Free Business Audit</h1>
        <p className="page-banner-sub" style={{ margin: '1rem 0 2rem' }}>
          Tell us about your business and website. We review your digital presence and growth priorities, then send a written report with a practical plan.
        </p>
        <SeoAuditForm auditType="business" />
      </div>
    </main>
  )
}
