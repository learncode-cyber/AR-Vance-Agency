'use client'

import { useEffect, useState } from 'react'

interface Testimonial {
  id: string
  clientName: string
  clientCompany?: string
  content: string
  rating: number
  published: boolean
  featured: boolean
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTestimonials()
  }, [])

  const loadTestimonials = async () => {
    try {
      const res = await fetch('/api/admin/testimonials')
      if (res.ok) {
        const data = await res.json()
        setTestimonials(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load testimonials:', error)
    } finally {
      setLoading(false)
    }
  }

  const StarRating = ({ rating }: { rating: number }) => (
    <div style={{ display: 'flex', gap: '0.25rem' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ color: star <= rating ? '#F59E0B' : 'var(--muted)' }}>
          ★
        </span>
      ))}
    </div>
  )

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Testimonials & Reviews</h1>
        <button className="admin-btn admin-btn-primary">+ Add Testimonial</button>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : (
          <>
            {/* Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Testimonials
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{testimonials.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Published
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {testimonials.filter((t) => t.published).length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Average Rating
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>
                  {testimonials.length > 0
                    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
                    : '—'}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Featured
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {testimonials.filter((t) => t.featured).length}
                </div>
              </div>
            </div>

            {/* Testimonials List */}
            <div className="admin-card">
              {testimonials.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No testimonials yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {testimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      style={{
                        padding: '1rem',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${testimonial.featured ? '#F59E0B' : 'var(--border)'}`,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <div>
                          <h4 style={{ fontWeight: '700', margin: 0, marginBottom: '0.25rem' }}>
                            {testimonial.clientName}
                          </h4>
                          {testimonial.clientCompany && (
                            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0 }}>
                              {testimonial.clientCompany}
                            </p>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <StarRating rating={testimonial.rating} />
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: testimonial.published ? '#10B98140' : '#F59E0B40',
                              color: testimonial.published ? '#10B981' : '#F59E0B',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {testimonial.published ? '✓ Published' : '⏳ Draft'}
                          </span>
                        </div>
                      </div>

                      <p style={{ margin: '0.75rem 0', color: 'var(--text)', fontStyle: 'italic' }}>
                        "{testimonial.content}"
                      </p>

                      <div style={{ textAlign: 'right' }}>
                        <button
                          className="admin-btn admin-btn-secondary"
                          style={{ fontSize: '0.8rem' }}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
