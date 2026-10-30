'use client'

import { useEffect, useState } from 'react'

interface ReferralProgram {
  id: string
  name: string
  referrerReward: number
  refereeReward: number
  active: boolean
  _count: { referrals: number }
  createdAt: string
}

export default function AdminReferralsPage() {
  const [programs, setPrograms] = useState<ReferralProgram[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPrograms()
  }, [])

  const loadPrograms = async () => {
    try {
      const res = await fetch('/api/admin/referral-programs')
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
        <h1 className="admin-topbar-title">Referral Programs</h1>
        <button className="admin-btn admin-btn-primary">+ Create Program</button>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : programs.length === 0 ? (
          <div className="admin-card">
            <p style={{ color: 'var(--muted)' }}>No referral programs yet</p>
          </div>
        ) : (
          <div className="admin-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Referrer Reward</th>
                  <th>Referee Reward</th>
                  <th>Active Referrals</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((program) => (
                  <tr key={program.id}>
                    <td className="font-medium">{program.name}</td>
                    <td>${program.referrerReward.toFixed(2)}</td>
                    <td>${program.refereeReward.toFixed(2)}</td>
                    <td className="font-medium">{program._count.referrals}</td>
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
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
                          Edit
                        </button>
                        <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
                          Referrals
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
