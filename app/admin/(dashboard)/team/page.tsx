'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/admin/Modal'
import ImageUploadField from '@/components/admin/ImageUploadField'

interface TeamMember {
  id: string
  slug: string
  email: string
  name: string
  role: string
  bio: string
  shortBio: string
  avatar: string
  specialization: string
  experience: string
  skills: string[]
  linkedin: string
  twitter: string
  website: string
  phone: string
  order: number
  active: boolean
  featured: boolean
  canEditProfile: boolean
}

const emptyForm = {
  slug: '',
  email: '',
  name: '',
  role: '',
  bio: '',
  shortBio: '',
  avatar: '',
  specialization: '',
  experience: '',
  skills: '' as any,
  linkedin: '',
  twitter: '',
  website: '',
  phone: '',
  order: 0,
  active: true,
  featured: false,
  canEditProfile: false,
}

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/team?limit=100')
      const json = await res.json()
      setMembers(json.data ?? [])
    } catch (error) {
      console.error('Load error:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(m: TeamMember) {
    setEditingId(m.id)
    setForm({
      slug: m.slug,
      email: m.email,
      name: m.name,
      role: m.role,
      bio: m.bio,
      shortBio: m.shortBio,
      avatar: m.avatar,
      specialization: m.specialization,
      experience: m.experience,
      skills: m.skills.join(', '),
      linkedin: m.linkedin,
      twitter: m.twitter,
      website: m.website,
      phone: m.phone,
      order: m.order,
      active: m.active,
      featured: m.featured,
      canEditProfile: m.canEditProfile,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name || !form.email || !form.slug) {
      alert('Name, Email, and Slug are required')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        skills: form.skills
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean),
      }

      const url = editingId ? `/api/admin/team/${editingId}` : '/api/admin/team'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setModalOpen(false)
        load()
      } else {
        const data = await res.json()
        alert(data.error ?? 'Failed to save')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save team member')
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this team member? This cannot be undone.')) return

    try {
      await fetch(`/api/admin/team/${id}`, { method: 'DELETE' })
      load()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete')
    }
  }

  async function toggleActive(m: TeamMember) {
    try {
      await fetch(`/api/admin/team/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !m.active }),
      })
      load()
    } catch (error) {
      console.error('Toggle error:', error)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Team Members</h1>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>
          + Add Member
        </button>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : members.length === 0 ? (
          <div className="admin-card">
            <p style={{ color: 'var(--muted)' }}>No team members yet. Click "Add Member" to get started.</p>
          </div>
        ) : (
          <div className="admin-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Specialization</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="font-medium">
                      <div>{m.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{m.slug}</div>
                    </td>
                    <td style={{ fontSize: '0.9rem' }}>{m.email}</td>
                    <td style={{ fontSize: '0.9rem' }}>{m.role}</td>
                    <td style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                      {m.specialization || '—'}
                    </td>
                    <td>
                      <button
                        onClick={() => toggleActive(m)}
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        <span className={m.active ? 'badge-active' : 'badge-inactive'}>
                          {m.active ? 'Published' : 'Draft'}
                        </span>
                      </button>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn admin-btn-edit" onClick={() => openEdit(m)}>
                          Edit
                        </button>
                        <button className="admin-btn admin-btn-delete" onClick={() => handleDelete(m.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal
          title={editingId ? 'Edit Team Member' : 'Add Team Member'}
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button className="btn btn-outline btn-sm" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button
                className="admin-btn admin-btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          }
        >
          <div className="form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Slug * (URL-friendly)</label>
                <input
                  className="form-input"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                  placeholder="john-doe"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input
                  className="form-input"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  placeholder="Lead Developer"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Specialization</label>
                <input
                  className="form-input"
                  value={form.specialization}
                  onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
                  placeholder="Frontend Development"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Experience</label>
                <input
                  className="form-input"
                  value={form.experience}
                  onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
                  placeholder="5 years"
                />
              </div>
            </div>

            <ImageUploadField
              label="Avatar"
              value={form.avatar}
              onChange={(v) => setForm((f) => ({ ...f, avatar: v }))}
            />

            <div className="form-group">
              <label className="form-label">Short Bio (for card)</label>
              <input
                className="form-input"
                value={form.shortBio}
                onChange={(e) => setForm((f) => ({ ...f, shortBio: e.target.value }))}
                placeholder="Brief one-liner about this person"
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Bio</label>
              <textarea
                className="form-textarea"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Detailed biography..."
                style={{ minHeight: 100 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Skills (comma separated)</label>
              <input
                className="form-input"
                value={form.skills}
                onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
                placeholder="React, Node.js, TypeScript"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">LinkedIn</label>
                <input
                  className="form-input"
                  value={form.linkedin}
                  onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Twitter</label>
                <input
                  className="form-input"
                  value={form.twitter}
                  onChange={(e) => setForm((f) => ({ ...f, twitter: e.target.value }))}
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Website</label>
                <input
                  className="form-input"
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  className="form-input"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Display Order</label>
                <input
                  className="form-input"
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--fg)' }}>
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  />
                  Published
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--fg)' }}>
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  />
                  Featured
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--fg)' }}>
                  <input
                    type="checkbox"
                    checked={form.canEditProfile}
                    onChange={(e) => setForm((f) => ({ ...f, canEditProfile: e.target.checked }))}
                  />
                  Can Edit Profile
                </label>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
