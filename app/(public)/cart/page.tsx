'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface CartItem {
  id: string
  product: any
  quantity: number
  price: number
}

interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        setCart(data.data)
      }
    } catch (error) {
      console.error('Failed to load cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      await fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })
      fetchCart()
    } catch (error) {
      console.error('Failed to update quantity:', error)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      await fetch(`/api/cart/${itemId}`, { method: 'DELETE' })
      fetchCart()
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }

  if (loading) {
    return <div className="section-py container">Loading cart...</div>
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="section-py container" style={{ textAlign: 'center' }}>
        <h1 className="page-banner-title">Shopping Cart</h1>
        <p style={{ color: 'var(--muted)', marginTop: '1rem', marginBottom: '2rem' }}>
          Your cart is empty
        </p>
        <Link href="/shop">
          <button className="admin-btn admin-btn-primary">Continue Shopping</button>
        </Link>
      </div>
    )
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const shipping = 50
  const total = subtotal + tax + shipping

  return (
    <main className="section-py">
      <div className="container max-w-4xl">
        <h1 className="page-banner-title">Shopping Cart</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '3rem' }}>
          {/* Items */}
          <div>
            <div className="admin-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item) => (
                    <tr key={item.id}>
                      <td className="font-medium">{item.product.name}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                          style={{ width: '60px', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                        />
                      </td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                      <td>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="admin-btn admin-btn-delete"
                          style={{ fontSize: '0.8rem' }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="admin-card">
            <h2 style={{ fontWeight: '700', marginBottom: '1.5rem' }}>Order Summary</h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <span>Tax (10%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <span>Shipping:</span>
              <span>${shipping.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '700' }}>
              <span>Total:</span>
              <span style={{ color: 'var(--primary)' }}>${total.toFixed(2)}</span>
            </div>

            <Link href="/checkout" style={{ display: 'block' }}>
              <button className="admin-btn admin-btn-primary" style={{ width: '100%', marginBottom: '0.5rem' }}>
                Proceed to Checkout
              </button>
            </Link>

            <Link href="/shop" style={{ display: 'block' }}>
              <button className="admin-btn admin-btn-secondary" style={{ width: '100%' }}>
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
