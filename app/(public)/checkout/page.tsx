'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    paymentMethod: 'stripe',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.customerName || !form.customerEmail || !form.shippingAddress.street) {
      alert('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        const data = await res.json()
        alert('Order placed successfully!')
        router.push(`/order-confirmation/${data.data.id}`)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error placing order')
    }
    setLoading(false)
  }

  return (
    <main className="section-py">
      <div className="container max-w-2xl">
        <h1 className="page-banner-title">Checkout</h1>

        <form onSubmit={handleSubmit} className="admin-card" style={{ marginTop: '3rem' }}>
          {/* Personal Info */}
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.5rem' }}>
            Personal Information
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label className="form-label">Full Name *</label>
              <input
                className="form-input"
                type="text"
                value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="form-label">Email *</label>
              <input
                className="form-input"
                type="email"
                value={form.customerEmail}
                onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Phone *</label>
            <input
              className="form-input"
              type="tel"
              value={form.customerPhone}
              onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
              required
            />
          </div>

          {/* Shipping Address */}
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.5rem', marginTop: '2rem' }}>
            Shipping Address
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Street Address *</label>
            <input
              className="form-input"
              type="text"
              value={form.shippingAddress.street}
              onChange={(e) => setForm((f) => ({ ...f, shippingAddress: { ...f.shippingAddress, street: e.target.value } }))}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label className="form-label">City *</label>
              <input
                className="form-input"
                type="text"
                value={form.shippingAddress.city}
                onChange={(e) => setForm((f) => ({ ...f, shippingAddress: { ...f.shippingAddress, city: e.target.value } }))}
                required
              />
            </div>
            <div>
              <label className="form-label">State/Province *</label>
              <input
                className="form-input"
                type="text"
                value={form.shippingAddress.state}
                onChange={(e) => setForm((f) => ({ ...f, shippingAddress: { ...f.shippingAddress, state: e.target.value } }))}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <label className="form-label">ZIP Code *</label>
              <input
                className="form-input"
                type="text"
                value={form.shippingAddress.zipCode}
                onChange={(e) => setForm((f) => ({ ...f, shippingAddress: { ...f.shippingAddress, zipCode: e.target.value } }))}
                required
              />
            </div>
            <div>
              <label className="form-label">Country *</label>
              <input
                className="form-input"
                type="text"
                value={form.shippingAddress.country}
                onChange={(e) => setForm((f) => ({ ...f, shippingAddress: { ...f.shippingAddress, country: e.target.value } }))}
                required
              />
            </div>
          </div>

          {/* Payment */}
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.5rem' }}>
            Payment Method
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="paymentMethod"
                value="stripe"
                checked={form.paymentMethod === 'stripe'}
                onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
              />
              <span style={{ marginLeft: '0.5rem' }}>Credit Card (Stripe)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={form.paymentMethod === 'paypal'}
                onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
              />
              <span style={{ marginLeft: '0.5rem' }}>PayPal</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="paymentMethod"
                value="bank_transfer"
                checked={form.paymentMethod === 'bank_transfer'}
                onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
              />
              <span style={{ marginLeft: '0.5rem' }}>Bank Transfer</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-btn admin-btn-primary"
            style={{ width: '100%', fontSize: '1rem', padding: '1rem' }}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>
    </main>
  )
}
