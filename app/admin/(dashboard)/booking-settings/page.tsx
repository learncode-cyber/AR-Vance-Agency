'use client'

import { useEffect, useState } from 'react'
import Modal from '@/components/admin/Modal'

interface Service {
  id: string
  name: string
  duration: number
  price: number
  icon: string
  active: boolean
}

interface Slot {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  maxBookings: number
  isAvailable: boolean
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function BookingSettingsPage() {
  const [services, setServices] = useState<Service[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'service' | 'slot'>('service')

  const [serviceForm, setServiceForm] = useState({
    name: '',
    duration: 60,
    price: 0,
    icon: '📞',
  })

  const [slotForm, setSlotForm] = useState({
    dayOfWeek: 0,
    startTime: '09:00',
    endTime: '10:00',
    maxBookings: 1,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [servicesRes, slotsRes] = await Promise.all([
        fetch('/api/admin/booking-services'),
        fetch('/api/admin/booking-slots'),
      ])

      if (servicesRes.ok) {
        const data = await servicesRes.json()
        setServices(data.data || [])
      }

      if (slotsRes.ok) {
        const data = await slotsRes.json()
        setSlots(data.data || [])
      }
    } catch (error) {
      console.error('Load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddService = async () => {
    try {
      const res = await fetch('/api/admin/booking-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceForm),
      })

      if (res.ok) {
        setModalOpen(false)
        loadData()
      }
    } catch (error) {
      console.error('Add service error:', error)
    }
  }

  const handleAddSlot = async () => {
    try {
      const res = await fetch('/api/admin/booking-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slotForm),
      })

      if (res.ok) {
        setModalOpen(false)
        loadData()
      }
    } catch (error) {
      console.error('Add slot error:', error)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Booking Settings</h1>
      </div>

      <div className="admin-content">
        {/* Services Section */}
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Consultation Services</h2>
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => {
                setModalType('service')
                setServiceForm({ name: '', duration: 60, price: 0, icon: '📞' })
                setModalOpen(true)
              }}
            >
              + Add Service
            </button>
          </div>

          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading…</p>
          ) : services.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No services configured</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {services.map((service) => (
                <div key={service.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{service.icon}</p>
                  <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{service.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                    {service.duration} min • ${service.price}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.85rem' }}>
                      Edit
                    </button>
                    <button className="admin-btn admin-btn-delete" style={{ fontSize: '0.85rem' }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Time Slots Section */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Available Time Slots</h2>
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => {
                setModalType('slot')
                setSlotForm({ dayOfWeek: 0, startTime: '09:00', endTime: '10:00', maxBookings: 1 })
                setModalOpen(true)
              }}
            >
              + Add Slot
            </button>
          </div>

          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading…</p>
          ) : slots.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No time slots configured</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Max Bookings</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr key={slot.id}>
                    <td className="font-medium">{daysOfWeek[slot.dayOfWeek]}</td>
                    <td>{slot.startTime} - {slot.endTime}</td>
                    <td>{slot.maxBookings}</td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        background: slot.isAvailable ? '#10B98140' : '#EF444440',
                        color: slot.isAvailable ? '#10B981' : '#EF4444',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                      }}>
                        {slot.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
                          Edit
                        </button>
                        <button className="admin-btn admin-btn-delete" style={{ fontSize: '0.8rem' }}>
                          Delete
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

      {/* Modal */}
      {modalOpen && (
        <Modal
          title={modalType === 'service' ? 'Add Service' : 'Add Time Slot'}
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button className="btn btn-outline btn-sm" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button
                className="admin-btn admin-btn-primary"
                onClick={modalType === 'service' ? handleAddService : handleAddSlot}
              >
                Add
              </button>
            </>
          }
        >
          <div className="form">
            {modalType === 'service' ? (
              <>
                <div className="form-group">
                  <label className="form-label">Service Name</label>
                  <input
                    className="form-input"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Duration (minutes)</label>
                    <input
                      className="form-input"
                      type="number"
                      value={serviceForm.duration}
                      onChange={(e) => setServiceForm((f) => ({ ...f, duration: parseInt(e.target.value) || 60 }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price ($)</label>
                    <input
                      className="form-input"
                      type="number"
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Icon Emoji</label>
                  <input
                    className="form-input"
                    value={serviceForm.icon}
                    onChange={(e) => setServiceForm((f) => ({ ...f, icon: e.target.value }))}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Day of Week</label>
                  <select
                    className="form-input"
                    value={slotForm.dayOfWeek}
                    onChange={(e) => setSlotForm((f) => ({ ...f, dayOfWeek: parseInt(e.target.value) }))}
                  >
                    {daysOfWeek.map((day, i) => (
                      <option key={i} value={i}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input
                      className="form-input"
                      type="time"
                      value={slotForm.startTime}
                      onChange={(e) => setSlotForm((f) => ({ ...f, startTime: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input
                      className="form-input"
                      type="time"
                      value={slotForm.endTime}
                      onChange={(e) => setSlotForm((f) => ({ ...f, endTime: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Max Bookings per Slot</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    value={slotForm.maxBookings}
                    onChange={(e) => setSlotForm((f) => ({ ...f, maxBookings: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
