'use client'
import { useState } from 'react'
import Link from 'next/link'

interface PortfolioItem {
  id: string; title: string; emoji: string; image: string
  category: string; tags: string[]; result: string; shortDesc: string
}

const CATS = ['All', 'SEO', 'Web Dev', 'Ads', 'Analytics', 'AI']

export default function PortfolioFilter({ items }: { items: PortfolioItem[] }) {
  const [active, setActive] = useState('All')

  const filtered = active === 'All'
    ? items
    : items.filter(p => p.category === active || p.tags.includes(active))

  return (
    <>
      <div className="filter-tabs">
        {CATS.map(c => (
          <button
            key={c}
            className={`filter-tab${active === c ? ' active' : ''}`}
            onClick={() => setActive(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="portfolio-grid">
          {filtered.map(p => (
            <div key={p.id} className="portfolio-card">
              <div className="portfolio-img">
                {p.image ? <img src={p.image} alt={p.title} /> : <span style={{ fontSize: '2.5rem' }}>{p.emoji}</span>}
              </div>
              <div className="portfolio-body">
                <div className="portfolio-tags">{p.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
                <h3 className="portfolio-title">{p.title}</h3>
                <p className="portfolio-desc">{p.shortDesc}</p>
                <p className="portfolio-result">📈 {p.result}</p>
                <Link href="/contact" className="portfolio-link">
                  Discuss a Similar Project
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--muted)' }}>No projects in this category yet.</p>
      )}
    </>
  )
}
