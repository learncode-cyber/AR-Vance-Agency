import { prisma } from '@/lib/prisma'

export default async function AdminDashboardPage() {
  const [serviceCount, blogCount, portfolioCount, leadCount, newLeads] = await Promise.all([
    prisma.service.count({ where: { active: true } }),
    prisma.blogPost.count({ where: { active: true } }),
    prisma.portfolioItem.count({ where: { active: true } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { stage: 'new' } }),
  ])

  const recentLeads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  // ── Form funnel analytics (last 30 days) ──
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const events = await prisma.formEvent.findMany({
    where: { createdAt: { gte: since } },
    select: { sessionId: true, eventType: true, fieldName: true },
  })
  const sessionsStarted   = new Set(events.filter(e => e.eventType === 'form_start').map(e => e.sessionId)).size
  const sessionsSubmitted = new Set(events.filter(e => e.eventType === 'form_submit').map(e => e.sessionId)).size
  const fieldFocusCounts: Record<string, number> = {}
  for (const e of events) {
    if (e.eventType === 'field_focus' && e.fieldName) {
      fieldFocusCounts[e.fieldName] = (fieldFocusCounts[e.fieldName] ?? 0) + 1
    }
  }
  const fieldOrder = ['name', 'email', 'phone', 'company', 'subject', 'service', 'message']
  const dropOffRate = sessionsStarted > 0 ? Math.round(((sessionsStarted - sessionsSubmitted) / sessionsStarted) * 100) : 0

  // ── Server-side conversion delivery status (last 30 days) ──
  const recentLeadsWithStatus = await prisma.lead.findMany({
    where: { createdAt: { gte: since } },
    select: { metaCapiStatus: true, googleAdsStatus: true, ga4Status: true },
  })
  const countSent = (field: 'metaCapiStatus' | 'googleAdsStatus' | 'ga4Status') =>
    recentLeadsWithStatus.filter(l => l[field] === 'sent').length
  const countAttempted = (field: 'metaCapiStatus' | 'googleAdsStatus' | 'ga4Status') =>
    recentLeadsWithStatus.filter(l => l[field] !== '').length

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Dashboard</h1>
      </div>

      <div className="admin-content">
        <div className="admin-stat-grid">
          <div className="admin-stat-card">
            <p className="admin-stat-val">{leadCount}</p>
            <p className="admin-stat-label">Total Leads {newLeads > 0 && `(${newLeads} new)`}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-val">{serviceCount}</p>
            <p className="admin-stat-label">Active Services</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-val">{blogCount}</p>
            <p className="admin-stat-label">Published Articles</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-val">{portfolioCount}</p>
            <p className="admin-stat-label">Portfolio Items</p>
          </div>
        </div>

        {/* Form Funnel Analytics */}
        <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--fg)', marginBottom: '.4rem' }}>
            Contact Form Funnel <span style={{ fontSize: '.72rem', fontWeight: 500, color: 'var(--muted)' }}>(last 30 days)</span>
          </h2>
          {sessionsStarted === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>No form interactions yet in this period.</p>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--fg)' }}>{sessionsStarted}</p>
                  <p style={{ fontSize: '.75rem', color: 'var(--muted)' }}>Started filling the form</p>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1.5rem', color: '#10b981' }}>{sessionsSubmitted}</p>
                  <p style={{ fontSize: '.75rem', color: 'var(--muted)' }}>Submitted successfully</p>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1.5rem', color: dropOffRate > 50 ? '#ef4444' : '#f59e0b' }}>{dropOffRate}%</p>
                  <p style={{ fontSize: '.75rem', color: 'var(--muted)' }}>Drop-off rate</p>
                </div>
              </div>

              <p style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.6rem', letterSpacing: '.05em', textTransform: 'uppercase' }}>
                Which fields visitors interact with
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                {fieldOrder.filter(f => fieldFocusCounts[f]).map(field => {
                  const count = fieldFocusCounts[field]
                  const pct = sessionsStarted > 0 ? Math.min(100, Math.round((count / sessionsStarted) * 100)) : 0
                  return (
                    <div key={field} style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                      <span style={{ fontSize: '.78rem', color: 'var(--fg)', width: 70, textTransform: 'capitalize', flexShrink: 0 }}>{field}</span>
                      <div style={{ flexGrow: 1, height: 8, background: 'var(--surface)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: '.72rem', color: 'var(--muted)', width: 36, textAlign: 'right', flexShrink: 0 }}>{count}</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Server-Side Conversion Delivery */}
        {(countAttempted('metaCapiStatus') + countAttempted('googleAdsStatus') + countAttempted('ga4Status')) > 0 && (
          <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--fg)', marginBottom: '1rem' }}>
              Server-Side Conversion Delivery <span style={{ fontSize: '.72rem', fontWeight: 500, color: 'var(--muted)' }}>(last 30 days)</span>
            </h2>
            <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
              {(['metaCapiStatus', 'googleAdsStatus', 'ga4Status'] as const).map(field => {
                const attempted = countAttempted(field)
                if (attempted === 0) return null
                const sent = countSent(field)
                const label = field === 'metaCapiStatus' ? 'Meta Conversions API' : field === 'googleAdsStatus' ? 'Google Ads API' : 'GA4 Measurement Protocol'
                return (
                  <div key={field}>
                    <p style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--fg)', marginBottom: '.2rem' }}>{label}</p>
                    <p style={{ fontSize: '.78rem', color: sent === attempted ? '#10b981' : '#f59e0b' }}>{sent} / {attempted} delivered</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="admin-card">
          <h2 style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--fg)', marginBottom: '1.25rem' }}>
            Recent Leads
          </h2>
          {recentLeads.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Subject</th><th>Stage</th><th>Received</th></tr>
              </thead>
              <tbody>
                {recentLeads.map(lead => (
                  <tr key={lead.id}>
                    <td>{lead.name}</td>
                    <td>{lead.email}</td>
                    <td>{lead.subject}</td>
                    <td><span className={lead.stage === 'new' ? 'badge-active' : 'badge-inactive'}>{lead.stage}</span></td>
                    <td>{new Date(lead.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>No leads yet — they'll appear here when someone submits the contact form.</p>
          )}
        </div>
      </div>
    </>
  )
}
