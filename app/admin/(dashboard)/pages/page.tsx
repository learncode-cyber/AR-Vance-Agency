'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

type Row = { id: string; title: string; slug: string; status: string; updatedAt?: string }

// Marketing page manager: create new pages, open the editor, publish/unpublish, view live, delete.
export default function AdminPagesList() {
  const router = useRouter()
  // Same rule as the sidebar: the admin root follows the custom ADMIN_PATH in the URL.
  const adminRoot = `/${usePathname()?.split('/')[1] || 'admin'}`
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/pages?limit=100')
    const j = await res.json().catch(() => ({}))
    setRows(res.ok ? (j.data ?? []) : [])
    if (!res.ok) setMsg({ ok: false, text: j.error ?? 'Could not load pages' })
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  async function create(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null)
    const res = await fetch('/api/admin/pages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: title.trim() }) })
    const j = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) { setMsg({ ok: false, text: j.error ?? 'Could not create page' }); return }
    router.push(`${adminRoot}/pages/${j.data.id}`)
  }

  async function setStatus(id: string, status: 'published' | 'draft') {
    setBusy(true)
    const res = await fetch(`/api/admin/pages/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    const j = await res.json().catch(() => ({}))
    setBusy(false)
    setMsg(res.ok ? { ok: true, text: status === 'published' ? 'Page published.' : 'Page moved to draft.' } : { ok: false, text: j.error ?? 'Update failed' })
    load()
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setBusy(true)
    const res = await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' })
    const j = await res.json().catch(() => ({}))
    setBusy(false)
    setMsg(res.ok ? { ok: true, text: 'Page deleted.' } : { ok: false, text: j.error ?? 'Delete failed' })
    load()
  }

  return (
    <>
      <div className="admin-topbar"><h1 className="admin-topbar-title">Pages</h1></div>
      <div className="admin-content">
        {msg && <div className={msg.ok ? 'form-msg' : 'form-error-msg'}>{msg.text}</div>}

        <form onSubmit={create} className="admin-card" style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <strong style={{ color: 'var(--navy)' }}>New page</strong>
          <input className="form-input" style={{ flex: '1 1 260px' }} required minLength={3} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page title, e.g. SEO for Dentists" />
          <button className="admin-btn admin-btn-primary" disabled={busy}>Create &amp; open editor</button>
        </form>

        <section className="admin-card">
          {loading ? <p>Loading…</p> : rows.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No pages yet. Create your first page above.</p> : (
            <table className="admin-table">
              <thead><tr><th>Title</th><th>URL</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.title}</strong></td>
                    <td><code>/p/{r.slug}</code></td>
                    <td><span className={r.status === 'published' ? 'badge-active' : ''}>{r.status}</span></td>
                    <td>
                      <div className="admin-actions">
                        <Link className="admin-btn admin-btn-edit" href={`${adminRoot}/pages/${r.id}`}>Edit</Link>
                        {r.status === 'published' && <Link className="admin-btn" href={`/p/${r.slug}`} target="_blank">View</Link>}
                        {r.status === 'published'
                          ? <button className="admin-btn" disabled={busy} onClick={() => setStatus(r.id, 'draft')}>Unpublish</button>
                          : <button className="admin-btn" disabled={busy} onClick={() => setStatus(r.id, 'published')}>Publish</button>}
                        <button className="admin-btn admin-btn-delete" disabled={busy} onClick={() => remove(r.id, r.title)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  )
}
