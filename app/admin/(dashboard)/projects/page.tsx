'use client'

import { useEffect, useState } from 'react'

interface Project {
  id: string
  name: string
  clientName: string
  status: string
  completionPercentage: number
  budget?: number
  startDate: string
  endDate?: string
  published: boolean
  featured: boolean
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/admin/projects?limit=50')
      if (res.ok) {
        const data = await res.json()
        setProjects(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors: any = {
    planning: '#F59E0B',
    in_progress: '#3B82F6',
    completed: '#10B981',
    on_hold: '#EF4444',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Project Tracking</h1>
        <button className="admin-btn admin-btn-primary">+ New Project</button>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : (
          <>
            {/* Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Projects
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{projects.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  In Progress
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {projects.filter((p) => p.status === 'in_progress').length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Completed
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {projects.filter((p) => p.status === 'completed').length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Budget
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>
                  ${projects.reduce((sum, p) => sum + (p.budget || 0), 0).toFixed(0)}
                </div>
              </div>
            </div>

            {/* Projects List */}
            <div className="admin-card">
              {projects.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No projects yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      style={{
                        padding: '1rem',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${statusColors[project.status]}`,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <div>
                          <h4 style={{ fontWeight: '700', margin: 0, marginBottom: '0.25rem' }}>
                            {project.name}
                            {project.featured && (
                              <span style={{ marginLeft: '0.5rem', color: '#F59E0B' }}>⭐</span>
                            )}
                          </h4>
                          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0 }}>
                            {project.clientName}
                          </p>
                        </div>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: statusColors[project.status] + '20',
                            color: statusColors[project.status],
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {project.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: '8px',
                            background: 'var(--border)',
                            borderRadius: '4px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${project.completionPercentage}%`,
                              background: statusColors[project.status],
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', minWidth: '50px' }}>
                          {project.completionPercentage}%
                        </span>
                      </div>

                      {/* Details */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.85rem',
                          color: 'var(--muted)',
                          borderTop: '1px solid var(--border)',
                          paddingTop: '0.75rem',
                        }}
                      >
                        <div>
                          📅 Started: {new Date(project.startDate).toLocaleDateString()}
                        </div>
                        {project.budget && (
                          <div>💰 Budget: ${project.budget.toFixed(2)}</div>
                        )}
                        <button
                          className="admin-btn admin-btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
