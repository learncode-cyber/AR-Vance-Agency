'use client'

import { useState } from 'react'

interface FeatureFlag {
  id: string
  name: string
  enabled: boolean
  rolloutPercentage: number
  minAppVersion: string
  active: boolean
}

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([
    {
      id: '1',
      name: 'dark_mode',
      enabled: true,
      rolloutPercentage: 100,
      minAppVersion: '1.0.0',
      active: true,
    },
    {
      id: '2',
      name: 'biometric_auth',
      enabled: true,
      rolloutPercentage: 50,
      minAppVersion: '1.1.0',
      active: true,
    },
    {
      id: '3',
      name: 'new_dashboard',
      enabled: false,
      rolloutPercentage: 25,
      minAppVersion: '1.2.0',
      active: true,
    },
  ])

  const toggleFlag = (id: string) => {
    setFlags((prev) =>
      prev.map((flag) =>
        flag.id === id ? { ...flag, enabled: !flag.enabled } : flag
      )
    )
  }

  const updateRollout = (id: string, percentage: number) => {
    setFlags((prev) =>
      prev.map((flag) =>
        flag.id === id ? { ...flag, rolloutPercentage: percentage } : flag
      )
    )
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Feature Flags</h1>
        <button className="admin-btn admin-btn-primary">+ Create Flag</button>
      </div>

      <div className="admin-content">
        <div className="admin-card">
          <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Active Flags</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {flags.map((flag) => (
              <div
                key={flag.id}
                style={{
                  padding: '1rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>
                    {flag.name}
                  </h4>
                  <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                    Min App Version: {flag.minAppVersion}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                    Rollout: {flag.rolloutPercentage}%
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={flag.rolloutPercentage}
                    onChange={(e) =>
                      updateRollout(flag.id, parseInt(e.target.value))
                    }
                    style={{ width: '150px' }}
                  />

                  <button
                    onClick={() => toggleFlag(flag.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: flag.enabled ? '#10B981' : '#EF4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    {flag.enabled ? '✓ Enabled' : '✗ Disabled'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="admin-card" style={{ marginTop: '1rem' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>About Feature Flags</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
            Control feature rollout to users with gradual deployment.
          </p>
          <ul style={{ color: 'var(--muted)', paddingLeft: '1.5rem' }}>
            <li>Enable/disable features instantly</li>
            <li>Gradual rollout with percentage control</li>
            <li>Version-based feature gating</li>
            <li>A/B testing support</li>
          </ul>
        </div>
      </div>
    </>
  )
}
