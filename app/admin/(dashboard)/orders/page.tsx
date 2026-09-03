'use client'

import { useEffect, useState } from 'react'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  total: number
  status: string
  createdAt: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data.data)
      }
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const statusColors: any = {
    pending: '#F59E0B',
    processing: '#3B82F6',
    shipped: '#10B981',
    delivered: '#10B981',
    cancelled: '#EF4444',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Orders</h1>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : orders.length === 0 ? (
          <div className="admin-card">
            <p style={{ color: 'var(--muted)' }}>No orders found</p>
          </div>
        ) : (
          <div className="admin-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-medium">{order.orderNumber}</td>
                    <td>{order.customerName}</td>
                    <td>
                      <a href={`mailto:${order.customerEmail}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                        {order.customerEmail}
                      </a>
                    </td>
                    <td>${order.total.toFixed(2)}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          background: statusColors[order.status],
                          color: '#fff',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.9rem' }}>{formatDate(order.createdAt)}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
                          View
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
    </>
  )
}
