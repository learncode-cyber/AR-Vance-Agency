'use client'

import { useState } from 'react'

interface ProjectMetrics {
  id: string
  name: string
  client: string
  roi: number
  satisfaction: number
  onTime: boolean
  revenue: number
  cost: number
  status: string
}

const mockProjects: ProjectMetrics[] = [
  { id: '1', name: 'E-Commerce Platform', client: 'TechCorp', roi: 320, satisfaction: 4.9, onTime: true, revenue: 85000, cost: 45000, status: 'completed' },
  { id: '2', name: 'Mobile App Redesign', client: 'StartupX', roi: 250, satisfaction: 4.7, onTime: true, revenue: 65000, cost: 35000, status: 'completed' },
  { id: '3', name: 'Brand Identity', client: 'Design Co', roi: 180, satisfaction: 4.5, onTime: false, revenue: 45000, cost: 28000, status: 'completed' },
  { id: '4', name: 'Dashboard Analytics', client: 'DataSys', roi: 290, satisfaction: 4.8, onTime: true, revenue: 72000, cost: 40000, status: 'completed' },
  { id: '5', name: 'Website Optimization', client: 'RetailCo', roi: 210, satisfaction: 4.6, onTime: true, revenue: 55000, cost: 32000, status: 'completed' },
]

export default function ProjectAnalyticsPage() {
  const [sortBy, setSortBy] = useState<keyof ProjectMetrics>('roi')

  const sortedProjects = [...mockProjects].sort((a, b) => {
    const aVal = a[sortBy]
    const bVal = b[sortBy]
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return bVal - aVal
    }
    return 0
  })

  const avgROI = (mockProjects.reduce((sum, p) => sum + p.roi, 0) / mockProjects.length).toFixed(0)
  const avgSatisfaction = (mockProjects.reduce((sum, p) => sum + p.satisfaction, 0) / mockProjects.length).toFixed(1)
  const onTimeRate = ((mockProjects.filter(p => p.onTime).length / mockProjects.length) * 100).toFixed(0)
  const totalProfit = mockProjects.reduce((sum, p) => sum + (p.revenue - p.cost), 0)

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Project Analytics</h1>
      </div>

      <div className="admin-content">
        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="admin-card">
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
              Average ROI
            </p>
            <p style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              +{avgROI}%
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--success)' }}>
              Across {mockProjects.length} projects
            </p>
          </div>

          <div className="admin-card">
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
              Avg Satisfaction
            </p>
            <p style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {avgSatisfaction} ⭐
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--warning)' }}>
              Client satisfaction
            </p>
          </div>

          <div className="admin-card">
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
              On-Time Delivery
            </p>
            <p style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {onTimeRate}%
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--success)' }}>
              Projects on schedule
            </p>
          </div>

          <div className="admin-card">
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
              Total Profit
            </p>
            <p style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              ${(totalProfit / 1000).toFixed(0)}K
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              Avg ${(totalProfit / mockProjects.length / 1000).toFixed(0)}K per project
            </p>
          </div>
        </div>

        {/* ROI Distribution */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div className="admin-card">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '700' }}>
              ROI by Project
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '0.75rem',
              height: '200px',
              padding: '1rem 0',
            }}>
              {mockProjects.map((p) => (
                <div
                  key={p.id}
                  style={{
                    flex: 1,
                    height: `${(p.roi / 320) * 100}%`,
                    background: 'var(--primary)',
                    borderRadius: '4px',
                  }}
                  title={`${p.name}: +${p.roi}%`}
                />
              ))}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '0.5rem',
              marginTop: '1rem',
              fontSize: '0.75rem',
              color: 'var(--muted)',
            }}>
              {mockProjects.map((p) => (
                <p key={p.id} style={{ textAlign: 'center' }}>{p.name.split(' ')[0]}</p>
              ))}
            </div>
          </div>

          <div className="admin-card">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '700' }}>
              Revenue vs Cost
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mockProjects.map((p) => (
                <div key={p.id}>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    {p.name}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', height: '20px' }}>
                    <div
                      style={{
                        flex: p.revenue / (p.revenue + p.cost),
                        background: 'var(--success)',
                        borderRadius: '4px 0 0 4px',
                      }}
                      title={`Revenue: $${p.revenue}K`}
                    />
                    <div
                      style={{
                        flex: p.cost / (p.revenue + p.cost),
                        background: 'var(--warning)',
                        borderRadius: '0 4px 4px 0',
                      }}
                      title={`Cost: $${p.cost}K`}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                    <span>Revenue: ${p.revenue}K</span>
                    <span>Profit: ${p.revenue - p.cost}K</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Table */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Project Details</h3>
            <select
              className="admin-btn admin-btn-secondary"
              value={String(sortBy)}
              onChange={(e) => setSortBy(e.target.value as keyof ProjectMetrics)}
            >
              <option value="roi">Sort by ROI</option>
              <option value="satisfaction">Sort by Satisfaction</option>
              <option value="revenue">Sort by Revenue</option>
              <option value="cost">Sort by Cost</option>
            </select>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Client</th>
                <th>Revenue</th>
                <th>Cost</th>
                <th>Profit</th>
                <th>ROI</th>
                <th>Satisfaction</th>
                <th>On-Time</th>
              </tr>
            </thead>
            <tbody>
              {sortedProjects.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium">{p.name}</td>
                  <td>{p.client}</td>
                  <td>${p.revenue}K</td>
                  <td>${p.cost}K</td>
                  <td style={{ fontWeight: '700', color: 'var(--success)' }}>
                    ${p.revenue - p.cost}K
                  </td>
                  <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                    +{p.roi}%
                  </td>
                  <td>
                    {p.satisfaction.toFixed(1)} ⭐
                  </td>
                  <td>
                    {p.onTime ? (
                      <span style={{ color: 'var(--success)', fontWeight: '700' }}>✅</span>
                    ) : (
                      <span style={{ color: 'var(--warning)', fontWeight: '700' }}>⚠️</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Export */}
        <div className="admin-card" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>
            Export Reports
          </h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="admin-btn admin-btn-primary">📥 Export as PDF</button>
            <button className="admin-btn admin-btn-secondary">📊 Export as CSV</button>
            <button className="admin-btn admin-btn-secondary">📧 Email Report</button>
          </div>
        </div>
      </div>
    </>
  )
}
