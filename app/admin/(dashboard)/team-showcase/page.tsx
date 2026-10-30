'use client'

import { useEffect, useState } from 'react'

interface TeamMember {
  id: string
  name: string
  position: string
  department?: string
  email: string
  published: boolean
  active: boolean
}

export default function AdminTeamShowcasePage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTeam()
  }, [])

  const loadTeam = async () => {
    try {
      const res = await fetch('/api/admin/team')
      if (res.ok) {
        const data = await res.json()
        setMembers(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load team:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Team Showcase</h1>
        <button className="admin-btn admin-btn-primary">+ Add Team Member</button>
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
                  Total Members
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{members.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Active
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {members.filter((m) => m.active).length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Published
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {members.filter((m) => m.published).length}
                </div>
              </div>
            </div>

            {/* Team Grid */}
            <div className="admin-card">
              {members.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No team members yet.</p>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {members.map((member) => (
                    <div
                      key={member.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        textAlign: 'center',
                      }}
                    >
                      {/* Avatar Placeholder */}
                      <div
                        style={{
                          background: 'var(--bg-secondary)',
                          height: '180px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--muted)',
                          fontSize: '3rem',
                        }}
                      >
                        👤
                      </div>

                      <div style={{ padding: '1rem' }}>
                        <h3 style={{ fontWeight: '700', marginBottom: '0.25rem' }}>{member.name}</h3>
                        <p style={{ color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                          {member.position}
                        </p>

                        {member.department && (
                          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                            {member.department}
                          </p>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              background: member.active ? '#10B98140' : '#F59E0B40',
                              color: member.active ? '#10B981' : '#F59E0B',
                              borderRadius: '3px',
                            }}
                          >
                            {member.active ? '✓ Active' : '⏸ Inactive'}
                          </span>
                          {member.published && (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.5rem',
                                background: '#3B82F640',
                                color: '#3B82F6',
                                borderRadius: '3px',
                              }}
                            >
                              Published
                            </span>
                          )}
                        </div>

                        <button
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
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
