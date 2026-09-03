'use client'

import { useEffect, useState } from 'react'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  active: boolean
  published: boolean
  category: any
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/admin/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.data)
      }
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Products</h1>
        <button className="admin-btn admin-btn-primary">+ Add Product</button>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : products.length === 0 ? (
          <div className="admin-card">
            <p style={{ color: 'var(--muted)' }}>No products found</p>
          </div>
        ) : (
          <div className="admin-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="font-medium">{product.name}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td>{product.category?.name || 'Uncategorized'}</td>
                    <td>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: product.active ? '#10B98140' : '#EF444440',
                          color: product.active ? '#10B981' : '#EF4444',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                        }}
                      >
                        {product.active ? 'Active' : 'Inactive'}
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
          </div>
        )}
      </div>
    </>
  )
}
