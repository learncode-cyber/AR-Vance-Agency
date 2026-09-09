'use client'
import { useState, useEffect } from 'react'

const emptyForm = {
  siteName: '', tagline: '', siteDescription: '', founded: '',
  contactEmail: '', contactPhone: '', address: '',
  socialLinkedin: '', socialTwitter: '', socialFacebook: '', socialInstagram: '',
  heroBadge: '', heroTitle: '', heroTitleAccent: '', heroSubtitle: '', heroCtaPrimary: '', heroCtaSecondary: '',
  ctaTitle: '', ctaSubtitle: '', ctaButton: '',
  seoDefaultTitle: '', seoDefaultDesc: '', seoTitleTemplate: '',
  ga4MeasurementId: '', metaPixelId: '', googleAdsConversionId: '', googleAdsConversionLabel: '',
  parentBrandName: '', parentBrandUrl: '', parentBrandRelationship: '', parentBrandShort: '',
  metaAccessToken: '', metaTestEventCode: '', ga4ApiSecret: '',
  googleAdsDeveloperToken: '', googleAdsOAuthClientId: '', googleAdsOAuthClientSecret: '',
  googleAdsCustomerId: '', googleAdsLoginCustomerId: '', googleAdsConversionActionId: '',
  googleAdsRefreshToken: '', // read-only display, never submitted — set via OAuth connect flow
}

function Field({ label, value, onChange, textarea = false, hint }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; hint?: string }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {textarea
        ? <textarea className="form-textarea" style={{ minHeight: 70 }} value={value} onChange={e => onChange(e.target.value)} />
        : <input className="form-input" value={value} onChange={e => onChange(e.target.value)} />
      }
      {hint && <p style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{hint}</p>}
    </div>
  )
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [oauthMsg, setOauthMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(json => {
      if (json.data) setForm(f => ({ ...f, ...json.data }))
      setLoading(false)
    })

    const params = new URLSearchParams(window.location.search)
    if (params.get('google_ads_connected')) {
      setOauthMsg({ type: 'success', text: '✅ Google Ads account connected successfully.' })
      window.history.replaceState({}, '', window.location.pathname)
    } else if (params.get('google_ads_error')) {
      setOauthMsg({ type: 'error', text: `⚠️ Google Ads connection failed: ${params.get('google_ads_error')}` })
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); setSaved(false) }

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    else { const d = await res.json(); alert(d.error ?? 'Failed to save.') }
  }

  if (loading) {
    return <><div className="admin-topbar"><h1 className="admin-topbar-title">Settings</h1></div><div className="admin-content"><p style={{ color: 'var(--muted)' }}>Loading…</p></div></>
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Site Settings</h1>
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      <div className="admin-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 720 }}>

        <div className="admin-card">
          <h2 style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1rem', color: 'var(--fg)', marginBottom: '1rem' }}>General</h2>
          <div className="form">
            <Field label="Site Name" value={form.siteName} onChange={v => set('siteName', v)} />
            <Field label="Tagline" value={form.tagline} onChange={v => set('tagline', v)} />
            <Field label="Site Description" value={form.siteDescription} onChange={v => set('siteDescription', v)} textarea />
            <Field label="Founded Year" value={form.founded} onChange={v => set('founded', v)} />
          </div>
        </div>

        <div className="admin-card">
          <h2 style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1rem', color: 'var(--fg)', marginBottom: '1rem' }}>Contact Info</h2>
          <div className="form">
            <Field label="Contact Email" value={form.contactEmail} onChange={v => set('contactEmail', v)} />
            <Field label="Phone Number" value={form.contactPhone} onChange={v => set('contactPhone', v)} />
            <Field label="Address" value={form.address} onChange={v => set('address', v)} />
          </div>
        </div>

        <div className="admin-card">
          <h2 style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1rem', color: 'var(--fg)', marginBottom: '1rem' }}>Social Links</h2>
          <div className="form">
            <Field label="LinkedIn URL"  value={form.socialLinkedin}  onChange={v => set('socialLinkedin', v)} />
            <Field label="Twitter URL"   value={form.socialTwitter}   onChange={v => set('socialTwitter', v)} />
            <Field label="Facebook URL"  value={form.socialFacebook}  onChange={v => set('socialFacebook', v)} />
            <Field label="Instagram URL" value={form.socialInstagram} onChange={v => set('socialInstagram', v)} />
          </div>
        </div>

        <div className="admin-card">
          <h2 style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1rem', color: 'var(--fg)', marginBottom: '1rem' }}>Homepage Hero</h2>
          <div className="form">
            <Field label="Badge Text" value={form.heroBadge} onChange={v => set('heroBadge', v)} />
            <Field label="Title" value={form.heroTitle} onChange={v => set('heroTitle', v)} />
            <Field label="Title Accent (gradient part)" value={form.heroTitleAccent} onChange={v => set('heroTitleAccent', v)} />
            <Field label="Subtitle" value={form.heroSubtitle} onChange={v => set('heroSubtitle', v)} textarea />
            <Field label="Primary Button Text" value={form.heroCtaPrimary} onChange={v => set('heroCtaPrimary', v)} />
            <Field label="Secondary Button Text" value={form.heroCtaSecondary} onChange={v => set('heroCtaSecondary', v)} />
          </div>
        </div>

        <div className="admin-card">
          <h2 style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1rem', color: 'var(--fg)', marginBottom: '1rem' }}>Bottom CTA Section</h2>
          <div className="form">
            <Field label="Title" value={form.ctaTitle} onChange={v => set('ctaTitle', v)} />
            <Field label="Subtitle" value={form.ctaSubtitle} onChange={v => set('ctaSubtitle', v)} textarea />
            <Field label="Button Text" value={form.ctaButton} onChange={v => set('ctaButton', v)} />
          </div>
        </div>

        <div className="admin-card">
          <h2 style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1rem', color: 'var(--fg)', marginBottom: '1rem' }}>SEO Defaults</h2>
          <div className="form">
            <Field label="Default Page Title" value={form.seoDefaultTitle} onChange={v => set('seoDefaultTitle', v)} />
            <Field label="Default Meta Description" value={form.seoDefaultDesc} onChange={v => set('seoDefaultDesc', v)} textarea />
            <Field label="Title Template" value={form.seoTitleTemplate} onChange={v => set('seoTitleTemplate', v)} hint="Use %s where the page title should appear, e.g. '%s | My Agency'" />
          </div>
        </div>

        <div className="admin-card">
          <h2 style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1rem', color: 'var(--fg)', marginBottom: '1rem' }}>Ads & Tracking</h2>
          <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            Leave any field blank to disable it — nothing loads on the site unless an ID is set here.
          </p>
          <div className="form">
            <Field label="Google Analytics 4 Measurement ID" value={form.ga4MeasurementId} onChange={v => set('ga4MeasurementId', v)} hint="Format: G-XXXXXXXXXX (from Google Analytics → Admin → Data Streams)" />
            <Field label="Meta (Facebook/Instagram) Pixel ID" value={form.metaPixelId} onChange={v => set('metaPixelId', v)} hint="Numeric ID from Meta Events Manager. Fires a 'Lead' event whenever the contact form is submitted successfully — use this to build retargeting audiences." />
            <Field label="Google Ads Conversion ID" value={form.googleAdsConversionId} onChange={v => set('googleAdsConversionId', v)} hint="Format: AW-XXXXXXXXX (from Google Ads → Tools → Conversions)" />
            <Field label="Google Ads Conversion Label" value={form.googleAdsConversionLabel} onChange={v => set('googleAdsConversionLabel', v)} hint="The label shown next to your conversion action, e.g. AbC-D_efG-h12_IjK. Both this and the Conversion ID above are required together." />
          </div>
        </div>

        <div className="admin-card">
          <h2 style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1rem', color: 'var(--fg)', marginBottom: '.4rem' }}>
            Meta Conversions API <span style={{ fontSize: '.68rem', fontWeight: 600, color: '#10b981', border: '1px solid #10b981', borderRadius: 100, padding: '.1rem .55rem', marginLeft: '.5rem' }}>Server-Side</span>
          </h2>
          <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            Sends the "Lead" event directly to Meta's servers on submission — works even when
            the browser Pixel is blocked (ad-blockers, iOS restrictions). Uses the same Pixel ID
            set above. Requires an Access Token from Meta Events Manager.
          </p>
          <div className="form">
            <Field label="Conversions API Access Token" value={form.metaAccessToken} onChange={v => set('metaAccessToken', v)} textarea hint="Events Manager → your Pixel → Settings → Conversions API → Generate access token" />
            <Field label="Test Event Code (optional)" value={form.metaTestEventCode} onChange={v => set('metaTestEventCode', v)} hint="Paste temporarily from Events Manager → Test Events tab to verify events arrive, then remove it for production." />
          </div>
        </div>

        <div className="admin-card">
          <h2 style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1rem', color: 'var(--fg)', marginBottom: '.4rem' }}>
            GA4 Measurement Protocol <span style={{ fontSize: '.68rem', fontWeight: 600, color: '#10b981', border: '1px solid #10b981', borderRadius: 100, padding: '.1rem .55rem', marginLeft: '.5rem' }}>Server-Side</span>
          </h2>
          <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            Sends a "generate_lead" event directly to Google Analytics 4 from the server. Uses
            the GA4 Measurement ID set above. If GA4 is linked to your Google Ads account, this
            data can also feed Google Ads conversion reporting without needing the Ads API.
          </p>
          <div className="form">
            <Field label="Measurement Protocol API Secret" value={form.ga4ApiSecret} onChange={v => set('ga4ApiSecret', v)} hint="GA4 Admin → Data Streams → your stream → Measurement Protocol API secrets → Create" />
          </div>
        </div>

        <div className="admin-card">
          <h2 style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1rem', color: 'var(--fg)', marginBottom: '.4rem' }}>
            Google Ads API — Conversion Upload <span style={{ fontSize: '.68rem', fontWeight: 600, color: '#10b981', border: '1px solid #10b981', borderRadius: 100, padding: '.1rem .55rem', marginLeft: '.5rem' }}>Server-Side</span>
          </h2>
          <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            Uploads click conversions directly to Google Ads via the official API when a lead
            arrives with a <code style={{ background: 'var(--surface)', padding: '.1em .4em', borderRadius: 4 }}>gclid</code> (i.e. they clicked a Google Ad). Requires an approved
            Developer Token and a one-time account connection below.
          </p>

          {oauthMsg && (
            <div className={`form-msg ${oauthMsg.type === 'success' ? 'form-success' : 'form-error-msg'}`} style={{ marginBottom: '1rem' }}>
              {oauthMsg.text}
            </div>
          )}

          <div className="form">
            <Field label="Developer Token" value={form.googleAdsDeveloperToken} onChange={v => set('googleAdsDeveloperToken', v)} hint="Google Ads → Tools & Settings → API Center. Requires Google's approval — apply if you haven't yet." />
            <Field label="OAuth Client ID" value={form.googleAdsOAuthClientId} onChange={v => set('googleAdsOAuthClientId', v)} hint="Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID (type: Web application)" />
            <Field label="OAuth Client Secret" value={form.googleAdsOAuthClientSecret} onChange={v => set('googleAdsOAuthClientSecret', v)} hint="From the same OAuth Client as above" />
            <Field label="Customer ID" value={form.googleAdsCustomerId} onChange={v => set('googleAdsCustomerId', v)} hint="Your Google Ads account ID, digits only (no dashes), e.g. 1234567890" />
            <Field label="Login Customer ID (optional)" value={form.googleAdsLoginCustomerId} onChange={v => set('googleAdsLoginCustomerId', v)} hint="Only needed if this account is managed under an MCC (manager account) — the MCC's ID, digits only" />
            <Field label="Conversion Action ID" value={form.googleAdsConversionActionId} onChange={v => set('googleAdsConversionActionId', v)} hint="Google Ads → Goals → Conversions → click your conversion action → the ID shown in the URL/details panel" />

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '.4rem' }}>
              <p style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--fg)', marginBottom: '.6rem' }}>
                Account Connection:{' '}
                {form.googleAdsRefreshToken
                  ? <span className="badge-active">Connected</span>
                  : <span className="badge-inactive">Not Connected</span>}
              </p>
              <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.75rem' }}>
                Save the Developer Token, OAuth Client ID and Client Secret above first, then
                click connect — you'll be sent to Google to authorize access, and sent back here
                automatically.
              </p>
              <a href="/api/admin/google-ads/connect" className="btn btn-outline btn-sm">
                {form.googleAdsRefreshToken ? 'Reconnect Google Ads Account' : 'Connect Google Ads Account'}
              </a>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2 style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1rem', color: 'var(--fg)', marginBottom: '1rem' }}>Parent Brand Attribution</h2>
          <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            Shown in the footer, About page, and structured data (Schema.org) — establishes this
            project's relationship to its parent company. Leave "Parent Brand Name" blank to hide
            this entirely.
          </p>
          <div className="form">
            <Field label="Parent Brand Name" value={form.parentBrandName} onChange={v => set('parentBrandName', v)} hint="e.g. AR Qudrix" />
            <Field label="Parent Brand Website" value={form.parentBrandUrl} onChange={v => set('parentBrandUrl', v)} hint="e.g. https://arqudrix.com — linked naturally from the footer" />
            <Field label="Relationship Statement" value={form.parentBrandRelationship} onChange={v => set('parentBrandRelationship', v)} hint='e.g. "A Digital & Technology Company by AR Qudrix" — shown in footer + About page' />
            <Field label="Short Form (for tight spaces)" value={form.parentBrandShort} onChange={v => set('parentBrandShort', v)} hint='e.g. "by AR Qudrix"' />
          </div>
        </div>

      </div>
    </>
  )
}
