import type { Metadata } from 'next'
import SeoAuditForm from '@/components/ui/SeoAuditForm'

export const metadata: Metadata = {
  title: 'Free SEO Audit | AR Vance Agency',
  description: 'Get a free SEO audit of your website. We review your search visibility and send a written report. No obligation.',
  alternates: { canonical: '/free-seo-audit' },
}

export default function FreeSeoAuditPage() {
  return (
    <main className="section-py">
      <div className="container" style={{ maxWidth: 640 }}>
        <span className="sec-tag">Free, no obligation</span>
        <h1 className="page-banner-title" style={{ marginTop: '.75rem' }}>Get Your Free SEO Audit</h1>
        <p className="page-banner-sub" style={{ margin: '1rem 0 2rem' }}>
          Send us your website address. We review your search visibility, technical health and content gaps, then send you a written report with clear next steps.
        </p>
        <SeoAuditForm />
      </div>
    </main>
  )
}
