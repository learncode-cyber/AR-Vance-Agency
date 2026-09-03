'use client'

import { useEffect, useState } from 'react'

interface UserProfile {
  id: string
  displayName: string
  bio: string
  followersCount: number
  followingCount: number
  postsCount: number
  points: number
  level: number
  isPublic: boolean
}

export default function AdminUserProfilesPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    try {
      const res = await fetch('/api/admin/user-profiles?limit=50')
      if (res.ok) {
        const data = await res.json()
        setProfiles(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">User Profiles</h1>
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
                  Total Users
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{profiles.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Posts
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {profiles.reduce((sum, p) => sum + p.postsCount, 0)}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Avg Points
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>
                  {profiles.length > 0
                    ? Math.round(profiles.reduce((sum, p) => sum + p.points, 0) / profiles.length)
                    : 0}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Public Profiles
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {profiles.filter((p) => p.isPublic).length}
                </div>
              </div>
            </div>

            {/* Profiles Grid */}
            <div className="admin-card">
              {profiles.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No user profiles yet.</p>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        textAlign: 'center',
                      }}
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          background: 'var(--bg-secondary)',
                          height: '100px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2rem',
                        }}
                      >
                        👤
                      </div>

                      <div style={{ padding: '1rem' }}>
                        <h3 style={{ fontWeight: '700', margin: 0, marginBottom: '0.5rem' }}>
                          {profile.displayName}
                        </h3>

                        {profile.bio && (
                          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0, marginBottom: '0.75rem' }}>
                            {profile.bio.substring(0, 60)}
                            {profile.bio.length > 60 ? '...' : ''}
                          </p>
                        )}

                        {/* Stats */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-around',
                            fontSize: '0.85rem',
                            marginBottom: '1rem',
                            color: 'var(--muted)',
                          }}
                        >
                          <div>
                            <strong>{profile.followersCount}</strong>
                            <br />
                            followers
                          </div>
                          <div>
                            <strong>{profile.postsCount}</strong>
                            <br />
                            posts
                          </div>
                          <div>
                            <strong>L{profile.level}</strong>
                            <br />
                            level
                          </div>
                        </div>

                        {/* Points Badge */}
                        <div
                          style={{
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            background: '#F59E0B40',
                            color: '#F59E0B',
                            borderRadius: '4px',
                            fontWeight: '600',
                            marginBottom: '0.75rem',
                          }}
                        >
                          ⭐ {profile.points} points
                        </div>

                        {/* Visibility */}
                        {!profile.isPublic && (
                          <div
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              background: '#EF444440',
                              color: '#EF4444',
                              borderRadius: '3px',
                              display: 'inline-block',
                              marginLeft: '0.5rem',
                            }}
                          >
                            🔒 Private
                          </div>
                        )}

                        <button
                          style={{
                            width: '100%',
                            marginTop: '1rem',
                            padding: '0.5rem',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          View Profile
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
