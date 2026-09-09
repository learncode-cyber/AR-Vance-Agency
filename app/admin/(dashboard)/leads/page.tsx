'use client'
import { useState, useEffect } from 'react'
import Modal from '@/components/admin/Modal'

interface Lead {
  id: string; name: string; email: string; phone: string; company: string
  subject: string; service: string; message: string; valueEstimate: number | null
  notes: string; stage: string; source: string; createdAt: string
}

const STAGES: { key: string; label: string; color: string }[] = [
  { key: 'new',            label: 'New',            color: '#6366f1' },
  { key: 'qualifying',     label: 'Qualifying',     color: '#f59e0b' },
  { key: 'proposal_sent',  label: 'Proposal Sent',  color: '#0ea5e9' },
  { key: 'won',            label: 'Won',            color: '#10b981' },
  { key: 'lost',           label: 'Lost',           color: '#ef4444' },
]

export default function AdminLeadsPage() {
  const [leads, setLeads]   = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Lead | null>(null)
  const [edit, setEdit] = useState({ phone: '', company: '', valueEstimate: '', notes: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/leads')
    const json = await res.json()
    setLeads(json.data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function openLead(lead: Lead) {
    setSelected(lead)
    setEdit({
      phone: lead.phone || '',
      company: lead.company || '',
      valueEstimate: lead.valueEstimate != null ? String(lead.valueEstimate) : '',
      notes: lead.notes || '',
    })
  }

  async function moveStage(lead: Lead, stage: string) {
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
        <h1 className="admin-topbar-title">Leads Pipeline ({leads.length})</h1>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : leads.length === 0 ? (
          <div className="admin-card">
            <p style={{ color: 'var(--muted)' }}>No leads yet. They'll appear here automatically when someone submits the contact form.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', overflowX: 'auto' }}>
            {STAGES.map(stage => {
              const stageLeads = leads.filter(l => l.stage === stage.key)
              return (
                <div key={stage.key} style={{ minWidth: 220 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.75rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color, display: 'inline-block' }} />
                    <p style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--fg)' }}>{stage.label}</p>
                    <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>({stageLeads.length})</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                    {stageLeads.map(lead => (
                      <div
                        key={lead.id}
                        onClick={() => openLead(lead)}
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
