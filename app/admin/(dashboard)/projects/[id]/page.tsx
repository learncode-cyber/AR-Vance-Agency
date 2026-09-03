'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ImageUploadField from '@/components/admin/ImageUploadField'
import { RichTextEditor } from '@/components/admin/RichTextEditor'

interface ProjectData {
  id: string
  name: string
  slug: string
  description: string
  clientId: string
  category: string
  budget: number
  status: string
  roi: number
  completionRate: number
  clientSatisfaction: number
  coverImage: string
  challenge: string
  solution: string
  outcome: string
  caseStudy: string
  testimonial: string
  testimonialAuthor: string
  testimonialRole: string
  testimonialImage: string
  published: boolean
  featuredInPortfolio: boolean
  showMetrics: boolean
  showTestimonial: boolean
  seoTitle: string
  seoDescription: string
  client: { name: string }
}

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<ProjectData>>({})

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/projects/${projectId}`)
        if (res.ok) {
          const json = await res.json()
          setProject(json.data)
          setForm(json.data)
        }
      } catch (error) {
        console.error('Load error:', error)
      }
      setLoading(false)
    }

    load()
  }, [projectId])

  async function handleSave() {
    if (!form.name || !form.category) {
      alert('Name and Category are required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        alert('Project updated!')
      } else {
        const data = await res.json()
        alert(data.error ?? 'Failed to save')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save project')
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="admin-content">Loading…</div>
  }

  if (!project) {
    return <div className="admin-content">Project not found</div>
  }

  return (
    <>
      <div className="admin-topbar">
        <button onClick={() => router.back()} style={{ marginRight: '1rem' }}>
          ← Back
        </button>
        <h1 className="admin-topbar-title">{project.name}</h1>
      </div>

      <div className="admin-content">
        <div className="form" style={{ maxWidth: '900px' }}>
          {/* Basic Info */}
          <div className="admin-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>
              Basic Information
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input
                  className="form-input"
                  value={form.name || ''}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Slug *</label>
                <input
                  className="form-input"
                  value={form.slug || ''}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={form.description || ''}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                style={{ minHeight: 100 }}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={form.category || ''}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                >
                  <option>Web Development</option>
                  <option>Mobile App</option>
                  <option>UI/UX Design</option>
                  <option>Branding</option>
                  <option>Digital Marketing</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-input"
                  value={form.status || 'active'}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="admin-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>
              Metrics & Results
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Budget ($)</label>
                <input
                  className="form-input"
                  type="number"
                  value={form.budget || 0}
                  onChange={(e) => setForm((f) => ({ ...f, budget: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">ROI (%)</label>
                <input
                  className="form-input"
                  type="number"
                  value={form.roi || 0}
                  onChange={(e) => setForm((f) => ({ ...f, roi: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Completion (%)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  max="100"
                  value={form.completionRate || 0}
                  onChange={(e) => setForm((f) => ({ ...f, completionRate: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Satisfaction (0-5)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  value={form.clientSatisfaction || 0}
                  onChange={(e) => setForm((f) => ({ ...f, clientSatisfaction: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>

          {/* Case Study */}
          <div className="admin-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>
              Case Study
            </h3>

            <div className="form-group">
              <label className="form-label">Challenge</label>
              <textarea
                className="form-textarea"
                value={form.challenge || ''}
                onChange={(e) => setForm((f) => ({ ...f, challenge: e.target.value }))}
                placeholder="What was the client's challenge?"
                style={{ minHeight: 80 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Solution</label>
              <textarea
                className="form-textarea"
                value={form.solution || ''}
                onChange={(e) => setForm((f) => ({ ...f, solution: e.target.value }))}
                placeholder="How did you solve it?"
                style={{ minHeight: 80 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Outcome</label>
              <textarea
                className="form-textarea"
                value={form.outcome || ''}
                onChange={(e) => setForm((f) => ({ ...f, outcome: e.target.value }))}
                placeholder="What were the results?"
                style={{ minHeight: 80 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Case Study Content</label>
              <RichTextEditor
                value={form.caseStudy || ''}
                onChange={(v) => setForm((f) => ({ ...f, caseStudy: v }))}
                minHeight={300}
              />
            </div>
          </div>

          {/* Testimonial */}
          <div className="admin-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>
              Testimonial
            </h3>

            <div className="form-group">
              <label className="form-label">Testimonial Quote</label>
              <textarea
                className="form-textarea"
                value={form.testimonial || ''}
                onChange={(e) => setForm((f) => ({ ...f, testimonial: e.target.value }))}
                style={{ minHeight: 80 }}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Author Name</label>
                <input
                  className="form-input"
                  value={form.testimonialAuthor || ''}
                  onChange={(e) => setForm((f) => ({ ...f, testimonialAuthor: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Author Role</label>
                <input
                  className="form-input"
                  value={form.testimonialRole || ''}
                  onChange={(e) => setForm((f) => ({ ...f, testimonialRole: e.target.value }))}
                  placeholder="CEO, Manager, etc"
                />
              </div>
            </div>

            <ImageUploadField
              label="Author Avatar"
              value={form.testimonialImage || ''}
              onChange={(v) => setForm((f) => ({ ...f, testimonialImage: v }))}
            />
          </div>

          {/* Media */}
          <div className="admin-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>
              Media
            </h3>

            <ImageUploadField
              label="Cover Image"
              value={form.coverImage || ''}
              onChange={(v) => setForm((f) => ({ ...f, coverImage: v }))}
            />
          </div>

          {/* SEO */}
          <div className="admin-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>
              SEO & Publishing
            </h3>

            <div className="form-group">
              <label className="form-label">SEO Title</label>
              <input
                className="form-input"
                value={form.seoTitle || ''}
                onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">SEO Description</label>
              <textarea
                className="form-textarea"
                value={form.seoDescription || ''}
                onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
                style={{ minHeight: 60 }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={form.published || false}
                  onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                />
                Publish on Portfolio
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={form.featuredInPortfolio || false}
                  onChange={(e) => setForm((f) => ({ ...f, featuredInPortfolio: e.target.checked }))}
                />
                Featured Project
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={form.showMetrics || true}
                  onChange={(e) => setForm((f) => ({ ...f, showMetrics: e.target.checked }))}
                />
                Show Metrics
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={form.showTestimonial || true}
                  onChange={(e) => setForm((f) => ({ ...f, showTestimonial: e.target.checked }))}
                />
                Show Testimonial
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="admin-btn admin-btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save Project'}
            </button>
            <button className="admin-btn admin-btn-secondary" onClick={() => router.back()}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
