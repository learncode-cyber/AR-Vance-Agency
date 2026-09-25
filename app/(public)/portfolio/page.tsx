'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Project {
  id: string
  slug: string
  name: string
  description: string
  category: string
  coverImage: string
  clientSatisfaction: number
  roi: number
  completionRate: number
  technologies: string
  featuredInPortfolio: boolean
  publishedAt: string
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/portfolio/projects')
        if (res.ok) {
          const data = await res.json()
          setProjects(data.data || [])
          
          // Extract categories
          const cats = [...new Set(data.data?.map((p: any) => p.category) || [])]
          setCategories(cats as string[])
        }
      } catch (error) {
        console.error('Failed to load projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const filteredProjects =
    selectedCategory === 'all'
      ? projects
      : projects.filter((p) => p.category === selectedCategory)

  return (
    <main className="section-py">
      {/* Page Header */}
      <section className="container mb-12 text-center">
        <h1 className="page-banner-title">Our Portfolio</h1>
        <p className="text-muted max-w-2xl mx-auto mt-4">
          Showcase of our best work. From concept to completion, we deliver results that exceed expectations.
        </p>
      </section>

      {/* Category Filter */}
      {categories.length > 0 && (
        <section className="container mb-8">
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className={`portfolio-filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Projects
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`portfolio-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Projects Grid */}
      <section className="container">
        {loading ? (
          <div className="text-center text-muted">Loading portfolio...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center text-muted">No projects found in this category</div>
        ) : (
          <div className="portfolio-grid">
            {filteredProjects.map((project) => (
              <Link key={project.id} href={`/portfolio/${project.slug}`}>
                <div className="portfolio-card">
                  {/* Cover Image */}
                  <div className="portfolio-card__image">
                    {project.coverImage ? (
                      <img src={project.coverImage} alt={project.name} />
                    ) : (
                      <div className="portfolio-card__placeholder">📸</div>
                    )}
                  </div>

                  {/* Overlay */}
                  <div className="portfolio-card__overlay">
                    <div className="portfolio-card__content">
                      <h3 className="portfolio-card__title">{project.name}</h3>
                      <p className="portfolio-card__category">{project.category}</p>
                      <p className="portfolio-card__description">
                        {project.description.substring(0, 100)}...
                      </p>

                      {/* Metrics */}
                      {(project.roi > 0 || project.clientSatisfaction > 0) && (
                        <div className="portfolio-card__metrics">
                          {project.roi > 0 && (
                            <span className="metric-badge">ROI: +{project.roi.toFixed(0)}%</span>
                          )}
                          {project.clientSatisfaction > 0 && (
                            <span className="metric-badge">
                              ⭐ {project.clientSatisfaction.toFixed(1)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* CTA */}
                      <div className="portfolio-card__cta">View Case Study →</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
