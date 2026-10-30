'use client'

import { useEffect, useState } from 'react'

interface Service {
  id: string
  name: string
  slug: string
  description: string
  basePrice?: number
  published: boolean
  order: number
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const res = await fetch('/api/admin/services')
      if (res.ok) {
        const data = await res.json()
        setServices(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          slug: formData.get('slug'),
          description: formData.get('description'),
          basePrice: formData.get('basePrice') ? parseFloat(formData.get('basePrice') as string) : undefined,
        }),
      })

      if (res.ok) {
        setShowForm(false)
        loadServices()
        ;(e.target as HTMLFormElement).reset()
      }
    } catch (error) {
      console.error('Failed to create service:', error)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Services Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="admin-btn admin-btn-primary"
        >
          {showForm ? '✕ Cancel' : '+ Add Service'}
        </button>
      </div>

      <div className="admin-content">
        {showForm && (
          <div className="admin-card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Create New Service</h3>
            <form onSubmit={handleAddService} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label className="form-label">Service Name *</label>
                <input name="name" type="text" className="form-input" required />
              </div>

              <div>
                <label className="form-label">Slug *</label>
                <input name="slug" type="text" className="form-input" required />
              </div>

              <div>
                <label className="form-label">Description *</label>
                <textarea name="description" className="form-input" rows={4} required />
              </div>

              <div>
                <label className="form-label">Base Price</label>
                <input name="basePrice" type="number" className="form-input" />
              </div>

              <button type="submit" className="admin-btn admin-btn-primary">
                Create Service
              </button>
            </form>
          </div>
        )}

        <div className="admin-card">
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading...</p>
          ) : services.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No services yet. Create one to get started!</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td className="font-medium">{service.name}</td>
                    <td className="font-mono text-sm">{service.slug}</td>
                    <td>{service.basePrice ? `$${service.basePrice}` : '—'}</td>
                    <td>
                      <span
                        style={{
                          color: service.published ? '#10B981' : '#F59E0B',
                        }}
                      >
                        {service.published ? '✓ Published' : '⏳ Draft'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
