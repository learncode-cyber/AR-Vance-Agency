'use client'

import { useEffect, useState } from 'react'

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  icon: string
  color: string
}

interface AvailableSlot {
  date: string
  time: string
  available: boolean
}

const emptyForm = {
  serviceId: '',
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  date: '',
  time: '',
  notes: '',
}

export default function BookingPage() {
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/booking/services')
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

    fetchServices()
  }, [])

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setForm((f) => ({ ...f, serviceId: service.id }))
    fetchAvailableSlots(service.id)
  }

  const fetchAvailableSlots = async (serviceId: string) => {
    try {
      const res = await fetch(`/api/booking/availability?serviceId=${serviceId}&days=14`)
      if (res.ok) {
        const data = await res.json()
        setAvailableSlots(data.slots || [])
      }
    } catch (error) {
      console.error('Failed to load slots:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.clientName || !form.clientEmail || !form.date || !form.time) {
      alert('Please fill all required fields')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          meetingType: 'zoom',
        }),
      })

      if (res.ok) {
        setSuccess(true)
        setForm(emptyForm)
        setSelectedService(null)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to book consultation')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Error booking consultation')
    }
    setSubmitting(false)
  }

  return (
    <main className="section-py">
      <div className="container max-w-4xl">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="page-banner-title">Book a Consultation</h1>
          <p className="text-muted mt-4">
            Schedule a meeting with our team to discuss your project and find the perfect solution.
          </p>
        </div>

        {success && (
          <div style={{
            padding: '1rem',
            background: '#10B98140',
            border: '1px solid #10B981',
            borderRadius: '8px',
            marginBottom: '2rem',
            color: '#10B981',
            fontWeight: '600',
          }}>
            ✅ Consultation booked! Check your email for confirmation.
          </div>
        )}

        {/* Step 1: Select Service */}
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
            Step 1: Select Service
          </h2>

          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading services...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  style={{
                    padding: '1.5rem',
                    border: selectedService?.id === service.id ? '2px solid var(--primary)' : '2px solid var(--border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: selectedService?.id === service.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  }}
                >
                  <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{service.icon}</p>
                  <h3 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>{service.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                    {service.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '600' }}>
                    <span>⏱️ {service.duration} min</span>
                    <span style={{ color: 'var(--primary)' }}>${service.price}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Select Date & Time */}
        {selectedService && (
          <div className="admin-card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
              Step 2: Select Date & Time
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <label className="form-label">Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>

              <div>
                <label className="form-label">Time</label>
                <input
                  className="form-input"
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Your Information */}
        {selectedService && (
          <form className="admin-card" onSubmit={handleSubmit}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
              Step 3: Your Information
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label">Full Name *</label>
                <input
                  className="form-input"
                  type="text"
                  value={form.clientName}
                  onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="form-label">Email *</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Phone Number *</label>
              <input
                className="form-input"
                type="tel"
                value={form.clientPhone}
                onChange={(e) => setForm((f) => ({ ...f, clientPhone: e.target.value }))}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Project Notes</label>
              <textarea
                className="form-textarea"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Tell us about your project..."
                style={{ minHeight: 100 }}
              />
            </div>

            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={submitting}
              style={{ width: '100%' }}
            >
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
