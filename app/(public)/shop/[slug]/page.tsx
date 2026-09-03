'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Product {
  id: string
  name: string
  description: string
  price: number
  comparePrice: number
  stock: number
  rating: number
  purchaseCount: number
  material: string
  color: string
  weight: number
  reviews: Array<any>
}

export default function ProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.slug}`)
        if (res.ok) {
          const data = await res.json()
          setProduct(data.data)
        }
      } catch (error) {
        console.error('Failed to load product:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchProduct()
    }
  }, [params.slug])

  const handleAddToCart = async () => {
    if (!product) return

    setAdding(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      })

      if (res.ok) {
        alert('Added to cart!')
      } else {
        alert('Failed to add to cart')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error adding to cart')
    }
    setAdding(false)
  }

  if (loading) {
    return <div className="section-py container">Loading...</div>
  }

  if (!product) {
    return <div className="section-py container">Product not found</div>
  }

  return (
    <main className="section-py">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '4rem' }}>
          {/* Image */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '12px',
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '5rem',
            }}
          >
            📦
          </div>

          {/* Details */}
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>{product.name}</h1>

            {/* Price */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
                ${product.price.toFixed(2)}
              </span>
              {product.comparePrice > 0 && (
                <span
                  style={{
                    marginLeft: '1rem',
                    textDecoration: 'line-through',
                    color: 'var(--muted)',
                    fontSize: '1.2rem',
                  }}
                >
                  ${product.comparePrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Rating */}
            {product.rating > 0 && (
              <div style={{ marginBottom: '1.5rem', color: 'var(--muted)' }}>
                {'⭐'.repeat(Math.round(product.rating))} ({product.purchaseCount} sold)
              </div>
            )}

            {/* Description */}
            <p style={{ color: 'var(--muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
              {product.description}
            </p>

            {/* Specs */}
            {(product.material || product.color || product.weight) && (
              <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                {product.material && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Material:</strong> {product.material}
                  </div>
                )}
                {product.color && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Color:</strong> {product.color}
                  </div>
                )}
                {product.weight > 0 && (
                  <div>
                    <strong>Weight:</strong> {product.weight} kg
                  </div>
                )}
              </div>
            )}

            {/* Stock Status */}
            <div style={{ marginBottom: '2rem' }}>
              {product.stock > 0 ? (
                <span style={{ color: '#10B981', fontWeight: '600' }}>✅ In Stock ({product.stock} available)</span>
              ) : (
                <span style={{ color: '#EF4444', fontWeight: '600' }}>❌ Out of Stock</span>
              )}
            </div>

            {/* Add to Cart */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label className="form-label">Quantity</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, product.stock))}
                  style={{ width: '80px' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  onClick={handleAddToCart}
                  disabled={adding || product.stock === 0}
                  className="admin-btn admin-btn-primary"
                  style={{ width: '200px' }}
                >
                  {adding ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {product.reviews.length > 0 && (
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Reviews</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {product.reviews.map((review: any) => (
                <div key={review.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>{review.reviewerName}</strong>
                    <span>{'⭐'.repeat(review.rating)}</span>
                  </div>
                  <p style={{ color: 'var(--muted)', marginBottom: '0.5rem' }}>{review.title}</p>
                  <p>{review.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
