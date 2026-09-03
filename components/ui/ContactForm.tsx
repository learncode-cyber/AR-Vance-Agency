'use client'
import { useState, useEffect, useRef } from 'react'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
  }
}

const SERVICES = [
  'SEO', 'Digital Marketing Strategy', 'Paid Advertising (PPC)',
  'Analytics & Tracking', 'WordPress Development', 'AI & Automation', 'Other',
]

interface ContactFormProps {
  metaPixelId?: string
  googleAdsConversionId?: string
  googleAdsConversionLabel?: string
}

function getCookie(name: string): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : ''
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function ContactForm({ metaPixelId, googleAdsConversionId, googleAdsConversionLabel }: ContactFormProps) {
  const [form, setForm]     = useState({ name: '', email: '', phone: '', company: '', subject: '', service: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  // Attribution + tracking identifiers — captured once on mount
  const attribution = useRef({ gclid: '', fbclid: '', fbp: '', fbc: '', landingPage: '', eventId: '', ga4ClientId: '' })
  const sessionId = useRef('')
  const startedTracking = useRef(false)
  const focusedFields = useRef<Set<string>>(new Set())

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    attribution.current = {
      gclid: params.get('gclid') ?? '',
      fbclid: params.get('fbclid') ?? '',
      fbp: getCookie('_fbp'),
      fbc: getCookie('_fbc') || (params.get('fbclid') ? `fb.1.${Date.now()}.${params.get('fbclid')}` : ''),
      landingPage: window.location.href,
      eventId: randomId(),
      ga4ClientId: (() => {
        const gaCookie = getCookie('_ga') // format: GA1.1.XXXXXXXXX.YYYYYYYYYY
        const parts = gaCookie.split('.')
        if (parts.length >= 4) return `${parts[2]}.${parts[3]}`
        let stored = localStorage.getItem('_da_ga4_cid')
        if (!stored) { stored = randomId(); localStorage.setItem('_da_ga4_cid', stored) }
        return stored
      })(),
    }
    sessionId.current = randomId()
  }, [])

  function trackEvent(eventType: string, fieldName = '') {
    try {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId.current, eventType, fieldName, page: window.location.pathname }),
        keepalive: true,
      }).catch(() => {})
    } catch { /* tracking never blocks the UI */ }
  }

  function handleFocus(fieldName: string) {
    if (!startedTracking.current) {
      startedTracking.current = true
      trackEvent('form_start')
    }
    if (!focusedFields.current.has(fieldName)) {
      focusedFields.current.add(fieldName)
      trackEvent('field_focus', fieldName)
    }
  }

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrMsg('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ...attribution.current }),
      })
      if (res.ok) {
        setStatus('success')
        trackEvent('form_submit')
        setForm({ name: '', email: '', phone: '', company: '', subject: '', service: '', message: '' })

        // Fire client-side ad-platform events too — Meta/Google dedup
        // these against the server-side CAPI/Ads-API events using the
        // same eventId, per each platform's documented dedup key.
        try {
          if (metaPixelId && window.fbq) {
            window.fbq('track', 'Lead', {}, { eventID: attribution.current.eventId })
          }
          if (googleAdsConversionId && googleAdsConversionLabel && window.gtag) {
            window.gtag('event', 'conversion', {
              send_to: `${googleAdsConversionId}/${googleAdsConversionLabel}`,
            })
          }
        } catch {
          // Tracking failure should never affect the user-facing form result
        }
      } else {
        const d = await res.json()
        setErrMsg(d.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
        trackEvent('form_error')
      }
    } catch {
      setErrMsg('Network error. Please try again.')
      setStatus('error')
      trackEvent('form_error')
    }
  }

  if (status === 'success') {
    return (
      <div className="form-msg form-success">
        ✅ Message sent! We'll get back to you within 1 business day.
      </div>
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {status === 'error' && <div className="form-msg form-error-msg">⚠️ {errMsg}</div>}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-input" required value={form.name} onChange={e => set('name', e.target.value)} onFocus={() => handleFocus('name')} placeholder="John Smith" />
        </div>
        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input className="form-input" type="email" required value={form.email} onChange={e => set('email', e.target.value)} onFocus={() => handleFocus('email')} placeholder="john@company.com" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} onFocus={() => handleFocus('phone')} placeholder="+880 1XX-XXXXXXX" />
        </div>
        <div className="form-group">
          <label className="form-label">Company</label>
          <input className="form-input" value={form.company} onChange={e => set('company', e.target.value)} onFocus={() => handleFocus('company')} placeholder="Your Company Ltd." />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Subject *</label>
          <input className="form-input" required value={form.subject} onChange={e => set('subject', e.target.value)} onFocus={() => handleFocus('subject')} placeholder="How can we help?" />
        </div>
        <div className="form-group">
          <label className="form-label">Service Interested In</label>
          <select className="form-select form-input" value={form.service} onChange={e => set('service', e.target.value)} onFocus={() => handleFocus('service')}>
            <option value="">Select a service…</option>
            {SERVICES.map(sv => <option key={sv} value={sv}>{sv}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Message * (min. 20 characters)</label>
        <textarea className="form-textarea" required minLength={20} value={form.message} onChange={e => set('message', e.target.value)} onFocus={() => handleFocus('message')} placeholder="Tell us about your project, goals, and timeline…" />
      </div>

      <button type="submit" className="btn btn-primary btn-lg" disabled={status === 'loading'} style={{ alignSelf: 'flex-start' }}>
        {status === 'loading' ? 'Sending…' : 'Send Message →'}
      </button>
    </form>
  )
}
