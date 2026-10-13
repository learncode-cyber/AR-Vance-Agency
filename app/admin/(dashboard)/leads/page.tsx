'use client'
import { useState, useEffect } from 'react';
import Modal from '@/components/admin/Modal';

// Card fields come from the paginated list; the rest is fetched when a card is opened.
interface Card {
  id: string; name: string; company: string; subject: string; service: string
  stage: string; source: string; valueEstimate: number | null; createdAt: string
}
interface Lead extends Card {
  email: string; phone: string; message: string; notes: string
}
interface Column { items: Card[]; nextCursor: string | null; loadingMore: boolean }
const PAGE_SIZE = 25
const emptyColumn = (): Column => ({ items: [], nextCursor: null, loadingMore: false })

const STAGES: { key: string; label: string; color: string }[] = [
  { key: 'new',            label: 'New',            color: '#6366f1' },
  { key: 'qualifying',     label: 'Qualifying',     color: '#f59e0b' },
  { key: 'proposal_sent',  label: 'Proposal Sent',  color: '#0ea5e9' },
  { key: 'won',            label: 'Won',            color: '#10b981' },
  { key: 'lost',           label: 'Lost',           color: '#ef4444' },
]

export default function AdminLeadsPage() {
  const [columns, setColumns] = useState<Record<string, Column>>({})
  const [totals, setTotals] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selected, setSelected] = useState<Lead | null>(null)
  const [opening, setOpening] = useState(false)
  const [edit, setEdit] = useState({ phone: '', company: '', valueEstimate: '', notes: '' })
  const [saving, setSaving] = useState(false)

  // First page of every column in parallel (one request per stage, 25 cards each).
  async function load() {
    setLoading(true); setLoadError('')
    try {
      const results = await Promise.all(STAGES.map(async (st) => {
        const res = await fetch(`/api/admin/leads?stage=${st.key}&limit=${PAGE_SIZE}`)
        if (!res.ok) throw new Error('load failed')
        return { key: st.key, json: await res.json() }
      }))
      const next: Record<string, Column> = {}
      let nextTotals: Record<string, number> = {}
      for (const { key, json } of results) {
        next[key] = { items: json.data ?? [], nextCursor: json.nextCursor ?? null, loadingMore: false }
        if (json.totals) nextTotals = { ...nextTotals, ...json.totals }
      }
      setColumns(next); setTotals(nextTotals)
    } catch {
      setLoadError('Could not load leads. Please refresh.')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  async function loadMore(stageKey: string) {
    const col = columns[stageKey]
    if (!col?.nextCursor || col.loadingMore) return
    setColumns(c => ({ ...c, [stageKey]: { ...c[stageKey], loadingMore: true } }))
    try {
      const res = await fetch(`/api/admin/leads?stage=${stageKey}&limit=${PAGE_SIZE}&cursor=${encodeURIComponent(col.nextCursor)}`)
      if (!res.ok) throw new Error('load failed')
      const json = await res.json()
      setColumns(c => {
        const seen = new Set(c[stageKey].items.map(i => i.id))
        const fresh = (json.data as Card[]).filter(i => !seen.has(i.id))
        return { ...c, [stageKey]: { items: [...c[stageKey].items, ...fresh], nextCursor: json.nextCursor ?? null, loadingMore: false } }
      })
    } catch {
      setColumns(c => ({ ...c, [stageKey]: { ...c[stageKey], loadingMore: false } }))
    }
  }

  async function openLead(card: Card) {
    setOpening(true)
    try {
      const res = await fetch(`/api/admin/leads/${card.id}`)
      if (!res.ok) throw new Error('not found')
      const { data: lead } = await res.json() as { data: Lead }
      setSelected(lead)
      setEdit({
      phone: lead.phone || '',
      company: lead.company || '',
        valueEstimate: lead.valueEstimate != null ? String(lead.valueEstimate) : '',
        notes: lead.notes || '',
      })
    } catch {
      setLoadError('Could not open this lead. It may have been deleted — refreshing.')
      load()
    } finally {
      setOpening(false)
    }
  }

  async function moveStage(lead: { id: string }, stage: string) {
    await fetch(`/api/admin/leads/${lead.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    })
    setSelected(null)
    load()
  }

  async function saveDetails() {
    if (!selected) return
    setSaving(true)
    await fetch(`/api/admin/leads/${selected.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: edit.phone,
        company: edit.company,
        valueEstimate: edit.valueEstimate.trim() === '' ? null : Number(edit.valueEstimate),
        notes: edit.notes,
      }),
    })
    setSaving(false)
    setSelected(null)
    load()
  }

  async function deleteLead(id: string) {
    if (!confirm('Delete this lead? This cannot be undone.')) return
    await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' })
    setSelected(null)
    load()
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Leads Pipeline ({Object.values(totals).reduce((a, b) => a + b, 0)})</h1>
      </div>

      <div className="admin-content">
        {loadError && <div className="form-msg form-error-msg" style={{ marginBottom: '1rem' }}>⚠️ {loadError}</div>}
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : Object.values(totals).reduce((a, b) => a + b, 0) === 0 ? (
          <div className="admin-card">
            <p style={{ color: 'var(--muted)' }}>No leads yet. They'll appear here automatically when someone submits the contact form.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', overflowX: 'auto' }}>
            {STAGES.map(stage => {
              const col = columns[stage.key] ?? emptyColumn()
              const stageLeads = col.items
              return (
                <div key={stage.key} style={{ minWidth: 220 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.75rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color, display: 'inline-block' }} />
                    <p style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--fg)' }}>{stage.label}</p>
                    <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>({totals[stage.key] ?? stageLeads.length})</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                    {stageLeads.map(lead => (
                      <div
                        key={lead.id}
                        onClick={() => !opening && openLead(lead)}
                        className="admin-card"
                        style={{ padding: '.9rem', cursor: 'pointer', borderLeft: `3px solid ${stage.color}` }}
                      >
                        <p style={{ fontSize: '.83rem', fontWeight: 700, color: 'var(--fg)', marginBottom: '.25rem' }}>{lead.name}</p>
                        {lead.company && <p style={{ fontSize: '.72rem', color: 'var(--primary-mid)', marginBottom: '.2rem' }}>{lead.company}</p>}
                        <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.subject}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{new Date(lead.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                          {lead.valueEstimate != null && (
                            <p style={{ fontSize: '.72rem', fontWeight: 700, color: '#10b981' }}>${lead.valueEstimate.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {col.nextCursor && (
                      <button className="btn btn-outline btn-sm" disabled={col.loadingMore} onClick={() => loadMore(stage.key)}>
                        {col.loadingMore ? 'Loading…' : `Load more (${Math.max((totals[stage.key] ?? 0) - stageLeads.length, 0)} left)`}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selected && (
        <Modal
          title={selected.name}
          onClose={() => setSelected(null)}
          footer={<>
            <button className="admin-btn admin-btn-delete" onClick={() => deleteLead(selected.id)}>Delete</button>
            <div style={{ flexGrow: 1 }} />
            {STAGES.filter(s => s.key !== selected.stage).map(s => (
              <button key={s.key} className="btn btn-outline btn-sm" onClick={() => moveStage(selected, s.key)}>
                Move to {s.label}
              </button>
            ))}
          </>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem', fontSize: '.85rem' }}>
            <div><strong style={{ color: 'var(--muted)' }}>Email:</strong> <a href={`mailto:${selected.email}`} style={{ color: 'var(--primary-mid)' }}>{selected.email}</a></div>
            <div><strong style={{ color: 'var(--muted)' }}>Subject:</strong> {selected.subject}</div>
            {selected.service && <div><strong style={{ color: 'var(--muted)' }}>Service Interested:</strong> {selected.service}</div>}
            <div><strong style={{ color: 'var(--muted)' }}>Source:</strong> {selected.source}</div>
            <div><strong style={{ color: 'var(--muted)' }}>Received:</strong> {new Date(selected.createdAt).toLocaleString('en-GB')}</div>
            <div>
              <strong style={{ color: 'var(--muted)', display: 'block', marginBottom: '.4rem' }}>Message:</strong>
              <p style={{ background: 'var(--surface)', padding: '.9rem', borderRadius: 8, whiteSpace: 'pre-wrap', color: 'var(--fg)' }}>{selected.message}</p>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '.9rem', marginTop: '.2rem' }}>
              <p style={{ fontWeight: 700, color: 'var(--fg)', marginBottom: '.75rem' }}>CRM Details (editable)</p>
              <div className="form-row" style={{ marginBottom: '.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={edit.phone} onChange={e => setEdit(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input className="form-input" value={edit.company} onChange={e => setEdit(f => ({ ...f, company: e.target.value }))} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '.75rem' }}>
                <label className="form-label">Estimated Deal Value ($)</label>
                <input className="form-input" type="number" min="0" value={edit.valueEstimate} onChange={e => setEdit(f => ({ ...f, valueEstimate: e.target.value }))} placeholder="e.g. 1200" />
              </div>
              <div className="form-group" style={{ marginBottom: '.75rem' }}>
                <label className="form-label">Internal Notes (not visible to the lead)</label>
                <textarea className="form-textarea" style={{ minHeight: 80 }} value={edit.notes} onChange={e => setEdit(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <button className="admin-btn admin-btn-primary" onClick={saveDetails} disabled={saving}>
                {saving ? 'Saving…' : 'Save CRM Details'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
