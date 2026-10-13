'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice: number
  thumbnail: string
  isFeatured: boolean
  rating: number
  purchaseCount: number
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/products/categories')
        if (res.ok) {
          const data = await res.json()
          setCategories(data.data)
        }
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        let url = `/api/products?page=${page}&limit=12`
        if (selectedCategory) url += `&category=${selectedCategory}`
        if (search) url += `&search=${search}`

        const res = await fetch(url)
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

    fetchProducts()
  }, [page, selectedCategory, search])

  return (
    <main className="section-py">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 className="page-banner-title">Shop</h1>
          <p className="text-muted" style={{ marginTop: '1rem' }}>
            Browse our collection of premium products
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', marginBottom: '3rem' }}>
          {/* Sidebar */}
          <div>
            {/* Search */}
            <div style={{ marginBottom: '2rem' }}>
              <label className="form-label">Search</label>
              <input
                className="form-input"
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>

            {/* Categories */}
            <div>
              <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Categories</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setSelectedCategory('')
                    setPage(1)
                  }}
                  style={{
                    padding: '0.75rem',
                    border: selectedCategory === '' ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: selectedCategory === '' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: selectedCategory === '' ? '600' : '400',
                  }}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.slug)
                      setPage(1)
                    }}
                    style={{
                      padding: '0.75rem',
                      border:
                        selectedCategory === cat.slug ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: selectedCategory === cat.slug ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: selectedCategory === cat.slug ? '600' : '400',
                    }}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div>
            {loading ? (
              <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '3rem' }}>Loading products...</p>
            ) : products.length === 0 ? (
              <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '3rem' }}>
                No products found
              </p>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  {products.map((product) => (
                    <Link key={product.id} href={`/shop/${product.slug}`}>
                      <div
                        style={{
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid var(--border)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary)'
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        {/* Image */}
                        <div
                          style={{
                            width: '100%',
                            height: '200px',
                            background: 'var(--bg-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3rem',
                            fontWeight: '300',
                            color: 'var(--muted)',
                          }}
                        >
                          📦
                        </div>

                        {/* Content */}
                        <div style={{ padding: '1rem' }}>
                          <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                            {product.name}
                          </h3>

                          {/* Price */}
                          <div style={{ marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>
                              ${product.price.toFixed(2)}
                            </span>
                            {product.comparePrice > 0 && (
                              <span
                                style={{
                                  marginLeft: '0.5rem',
                                  textDecoration: 'line-through',
                                  color: 'var(--muted)',
                                  fontSize: '0.9rem',
                                }}
                              >
                                ${product.comparePrice.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Rating */}
                          {product.rating > 0 && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                              {'⭐'.repeat(Math.round(product.rating))} ({product.purchaseCount} sold)
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
