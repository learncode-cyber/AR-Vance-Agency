'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Project {
  id: string
  slug: string
  name: string
  description: string
  category: string
  coverImage: string
  gallery: string
  beforeAfterGallery: string
  challenge: string
  solution: string
  outcome: string
  testimonial: string
  testimonialAuthor: string
  testimonialRole: string
  testimonialImage: string
  roi: number
  clientSatisfaction: number
  completionRate: number
  resultsHighlights: string
  keyMetrics: string
  technologies: string
  client: { name: string }
}

export default function PortfolioDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/portfolio/projects/${slug}`)
        if (res.ok) {
          const data = await res.json()
          setProject(data.data)
        }
      } catch (error) {
        console.error('Failed to load project:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [slug])

  if (loading) return <main className="section-py container">Loading...</main>
  if (!project) return <main className="section-py container">Project not found</main>

  const gallery = project.gallery ? JSON.parse(project.gallery) : []
  const beforeAfter = project.beforeAfterGallery ? JSON.parse(project.beforeAfterGallery) : []
  const highlights = project.resultsHighlights ? JSON.parse(project.resultsHighlights) : []
  const metrics = project.keyMetrics ? JSON.parse(project.keyMetrics) : []
  const tech = project.technologies ? JSON.parse(project.technologies) : []

  return (
    <main className="section-py">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <Link href="/portfolio" className="text-primary text-sm font-medium mb-4 inline-block">
            ← Back to Portfolio
          </Link>
          <h1 className="page-banner-title">{project.name}</h1>
          <p className="text-muted mt-2">{project.category}</p>
        </div>

        {/* Cover Image */}
        {project.coverImage && (
          <div className="mb-8" style={{ borderRadius: '8px', overflow: 'hidden' }}>
            <img src={project.coverImage} alt={project.name} style={{ width: '100%', display: 'block' }} />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
          {/* Main Content */}
          <div>
            {/* Challenge */}
            {project.challenge && (
              <section className="mb-8">
                <h2 className="section-title">The Challenge</h2>
                <p className="text-muted leading-relaxed">{project.challenge}</p>
              </section>
            )}

            {/* Solution */}
            {project.solution && (
              <section className="mb-8">
                <h2 className="section-title">Our Solution</h2>
                <p className="text-muted leading-relaxed">{project.solution}</p>
              </section>
            )}

            {/* Outcome */}
            {project.outcome && (
              <section className="mb-8">
                <h2 className="section-title">Results & Outcome</h2>
                <p className="text-muted leading-relaxed">{project.outcome}</p>
              </section>
            )}

            {/* Results Highlights */}
            {highlights.length > 0 && (
              <section className="mb-8">
                <h3 className="section-title">Key Highlights</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                  {highlights.map((h: any, i: number) => (
                    <div key={i} className="admin-card">
                      <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{h.icon}</p>
                      <p className="font-medium">{h.label}</p>
                      <p style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--primary)' }}>
                        {h.value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Gallery */}
            {gallery.length > 0 && (
              <section className="mb-8">
                <h3 className="section-title">Project Gallery</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  {gallery.map((img: string, i: number) => (
                    <img key={i} src={img} alt={`Gallery ${i}`} style={{ borderRadius: '8px', width: '100%' }} />
                  ))}
                </div>
              </section>
            )}

            {/* Before & After */}
            {beforeAfter.length > 0 && (
              <section className="mb-8">
                <h3 className="section-title">Before & After</h3>
                <div style={{ display: 'grid', gap: '2rem' }}>
                  {beforeAfter.map((ba: any, i: number) => (
                    <div key={i}>
                      <p className="font-medium mb-2">{ba.label}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Before</p>
                          <img src={ba.before} alt="Before" style={{ borderRadius: '8px', width: '100%' }} />
                        </div>
                        <div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>After</p>
                          <img src={ba.after} alt="After" style={{ borderRadius: '8px', width: '100%' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Metrics */}
            <div className="admin-card mb-4">
              <h4 style={{ fontWeight: '700', marginBottom: '1rem' }}>Project Metrics</h4>
              {project.roi > 0 && (
                <div className="mb-3">
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>ROI</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                    +{project.roi.toFixed(0)}%
                  </p>
                </div>
              )}
              {project.clientSatisfaction > 0 && (
                <div className="mb-3">
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Client Satisfaction</p>
                  <p style={{ fontSize: '1.5rem' }}>{'⭐'.repeat(Math.round(project.clientSatisfaction))}</p>
                </div>
              )}
              {project.completionRate > 0 && (
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Completion Rate</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{project.completionRate.toFixed(0)}%</p>
                </div>
              )}
            </div>

            {/* Client */}
            <div className="admin-card mb-4">
              <h4 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Client</h4>
              <p style={{ color: 'var(--muted)' }}>{project.client.name}</p>
            </div>

            {/* Technologies */}
            {tech.length > 0 && (
              <div className="admin-card mb-4">
                <h4 style={{ fontWeight: '700', marginBottom: '1rem' }}>Technologies</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {tech.map((t: string, i: number) => (
                    <span key={i} className="tech-badge">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Testimonial */}
            {project.testimonial && (
              <div className="admin-card">
                <div style={{ textAlign: 'center' }}>
                  {project.testimonialImage && (
                    <img
                      src={project.testimonialImage}
                      alt={project.testimonialAuthor}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        marginBottom: '1rem',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  <blockquote style={{ fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '1rem' }}>
                    "{project.testimonial}"
                  </blockquote>
                  <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{project.testimonialAuthor}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{project.testimonialRole}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
