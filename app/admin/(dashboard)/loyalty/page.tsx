'use client'

import { useEffect, useState } from 'react'

interface LoyaltyProgram {
  id: string
  name: string
  pointsPerDollar: number
  active: boolean
  _count: { members: number }
  createdAt: string
}

export default function AdminLoyaltyPage() {
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPrograms()
  }, [])

  const loadPrograms = async () => {
    try {
      const res = await fetch('/api/admin/loyalty-programs')
      if (res.ok) {
        const data = await res.json()
        setPrograms(data.data)
      }
    } catch (error) {
      console.error('Failed to load programs:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Loyalty Programs</h1>
        <button className="admin-btn admin-btn-primary">+ Create Program</button>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : programs.length === 0 ? (
          <div className="admin-card">
            <p style={{ color: 'var(--muted)' }}>No loyalty programs yet</p>
          </div>
        ) : (
          <div className="admin-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Program Name</th>
                  <th>Points per $</th>
                  <th>Members</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((program) => (
                  <tr key={program.id}>
                    <td className="font-medium">{program.name}</td>
                    <td>{program.pointsPerDollar}</td>
                    <td className="font-medium">{program._count.members}</td>
                    <td>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: program.active ? '#10B98140' : '#EF444440',
                          color: program.active ? '#10B981' : '#EF4444',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                        }}
                      >
                        {program.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(program.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
                          Edit
                        </button>
                        <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
                          Members
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
