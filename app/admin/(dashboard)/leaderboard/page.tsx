'use client'

import { useEffect, useState } from 'react'

interface LeaderboardEntry {
  id: string
  userId: string
  userName: string
  userAvatar: string
  totalPoints: number
  level: number
  globalRank: number
  monthlyRank: number
}

export default function AdminLeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'global' | 'monthly' | 'weekly'>('global')

  useEffect(() => {
    loadLeaderboard()
  }, [period])

  const loadLeaderboard = async () => {
    try {
      const res = await fetch(`/api/admin/leaderboard?period=${period}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        setEntries(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `${rank}`
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Community Leaderboard</h1>
      </div>

      <div className="admin-content">
        {/* Period Filter */}
        <div className="admin-card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['global', 'monthly', 'weekly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '0.5rem 1rem',
                  background: period === p ? 'var(--primary)' : 'var(--border)',
                  color: period === p ? 'white' : 'var(--text)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: period === p ? '700' : '400',
                }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="admin-card">
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading...</p>
          ) : entries.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No leaderboard data yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Rank</th>
                  <th>User</th>
                  <th>Level</th>
                  <th>Points</th>
                  <th>Badge Count</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr key={entry.id}>
                    <td style={{ fontSize: '1.2rem', fontWeight: '700', textAlign: 'center' }}>
                      {getMedalEmoji(idx + 1)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--bg-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                          }}
                        >
                          👤
                        </div>
                        <div>
                          <strong>{entry.userName}</strong>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          background: '#3B82F640',
                          color: '#3B82F6',
                          borderRadius: '4px',
                          fontWeight: '600',
                        }}
                      >
                        Level {entry.level}
                      </div>
                    </td>
                    <td className="font-mono" style={{ fontWeight: '700' }}>
                      {entry.totalPoints}
                    </td>
                    <td className="text-center">0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Info */}
        <div className="admin-card" style={{ marginTop: '1rem' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>How Leaderboard Works</h3>
          <ul style={{ color: 'var(--muted)', paddingLeft: '1.5rem' }}>
            <li>Users earn points by posting, commenting, and receiving likes</li>
            <li>Every 100 points = 1 level up</li>
            <li>Badges are earned through achievements</li>
            <li>Leaderboard resets monthly for monthly rankings</li>
            <li>Weekly rankings update every Sunday</li>
          </ul>
        </div>
      </div>
    </>
  )
}
