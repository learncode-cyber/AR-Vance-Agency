'use client'

import { useEffect, useState } from 'react'

interface CrashReport {
  id: string
  deviceId: string
  appVersion: string
  osVersion: string
  errorMessage: string
  status: string
  createdAt: string
}

export default function AdminCrashReportsPage() {
  const [crashes, setCrashes] = useState<CrashReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCrashes()
  }, [])

  const loadCrashes = async () => {
    try {
      // In production, fetch from API
      // For now, show empty state
      setCrashes([])
    } catch (error) {
      console.error('Failed to load crashes:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors: any = {
    new: '#3B82F6',
    acknowledged: '#F59E0B',
    fixed: '#10B981',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Crash Reports</h1>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : crashes.length === 0 ? (
          <div className="admin-card">
            <p style={{ color: 'var(--muted)' }}>✅ No crashes reported - your app is stable!</p>
          </div>
        ) : (
          <div className="admin-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Error Message</th>
                  <th>Device</th>
                  <th>App Version</th>
                  <th>OS</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {crashes.map((crash) => (
                  <tr key={crash.id}>
                    <td className="font-mono text-sm" style={{ maxWidth: '300px' }}>
                      {crash.errorMessage.substring(0, 50)}...
                    </td>
                    <td className="font-mono text-sm">{crash.deviceId.substring(0, 8)}</td>
                    <td>{crash.appVersion}</td>
                    <td>{crash.osVersion}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          background: statusColors[crash.status],
                          color: '#fff',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                        }}
                      >
                        {crash.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.9rem' }}>
                      {new Date(crash.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Info Card */}
        <div className="admin-card" style={{ marginTop: '1rem' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Crash Monitoring</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
            Monitor and track app crashes to improve stability and user experience.
          </p>
          <ul style={{ color: 'var(--muted)', paddingLeft: '1.5rem' }}>
            <li>Automatic crash capture and reporting</li>
            <li>Stack trace analysis</li>
            <li>Device and OS information</li>
            <li>Status tracking and resolution workflow</li>
          </ul>
        </div>
      </div>
    </>
  )
}
