'use client'

import { useState } from 'react'

interface TeamMember {
  id: string
  name: string
  role: string
  projects: number
  utilization: number
  rating: number
  onTimeDelivery: number
  revenue: number
  satisfaction: number
}

const mockTeamData: TeamMember[] = [
  { id: '1', name: 'John Doe', role: 'Lead Developer', projects: 12, utilization: 95, rating: 4.8, onTimeDelivery: 98, revenue: 180000, satisfaction: 4.9 },
  { id: '2', name: 'Jane Smith', role: 'UI/UX Designer', projects: 8, utilization: 85, rating: 4.6, onTimeDelivery: 94, revenue: 120000, satisfaction: 4.7 },
  { id: '3', name: 'Mike Johnson', role: 'Backend Developer', projects: 10, utilization: 90, rating: 4.5, onTimeDelivery: 96, revenue: 150000, satisfaction: 4.6 },
  { id: '4', name: 'Sarah Lee', role: 'Project Manager', projects: 15, utilization: 100, rating: 4.7, onTimeDelivery: 99, revenue: 140000, satisfaction: 4.8 },
  { id: '5', name: 'Tom Brown', role: 'QA Engineer', projects: 18, utilization: 92, rating: 4.4, onTimeDelivery: 95, revenue: 110000, satisfaction: 4.5 },
]

export default function TeamPerformancePage() {
  const [sortBy, setSortBy] = useState<keyof TeamMember>('revenue')
  const [ascending, setAscending] = useState(false)

  const sortedTeam = [...mockTeamData].sort((a, b) => {
    const aVal = a[sortBy]
    const bVal = b[sortBy]
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return ascending ? aVal - bVal : bVal - aVal
    }
    return 0
  })

  const avgRating = (mockTeamData.reduce((sum, m) => sum + m.rating, 0) / mockTeamData.length).toFixed(1)
  const totalRevenue = mockTeamData.reduce((sum, m) => sum + m.revenue, 0)
  const avgUtilization = (mockTeamData.reduce((sum, m) => sum + m.utilization, 0) / mockTeamData.length).toFixed(1)
  const avgSatisfaction = (mockTeamData.reduce((sum, m) => sum + m.satisfaction, 0) / mockTeamData.length).toFixed(1)

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Team Performance</h1>
      </div>

      <div className="admin-content">
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="admin-card">
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
              Team Members
            </p>
            <p style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {mockTeamData.length}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              Across all departments
            </p>
          </div>

          <div className="admin-card">
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
              Total Projects Delivered
            </p>
            <p style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {mockTeamData.reduce((sum, m) => sum + m.projects, 0)}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              Avg {(mockTeamData.reduce((sum, m) => sum + m.projects, 0) / mockTeamData.length).toFixed(0)} per member
            </p>
          </div>

          <div className="admin-card">
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
              Avg Performance Rating
            </p>
            <p style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {avgRating} ⭐
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--success)' }}>
              Excellent team quality
            </p>
          </div>

          <div className="admin-card">
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
              Team Revenue Generated
            </p>
            <p style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              ${(totalRevenue / 1000).toFixed(0)}K
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              Average: ${(totalRevenue / mockTeamData.length / 1000).toFixed(0)}K per member
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="admin-card">
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '700' }}>
              Avg Utilization
            </h3>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                {avgUtilization}%
              </p>
              <div style={{
                height: '12px',
                background: 'var(--bg-secondary)',
                borderRadius: '6px',
                overflow: 'hidden',
              }}>
                <div
                  style={{
                    height: '100%',
                    width: `${avgUtilization}%`,
                    background: 'var(--primary)',
                  }}
                />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                Team capacity utilization
              </p>
            </div>
          </div>

          <div className="admin-card">
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '700' }}>
              On-Time Delivery
            </h3>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--success)', marginBottom: '0.5rem' }}>
                96.4%
              </p>
              <div style={{
                height: '12px',
                background: 'var(--bg-secondary)',
                borderRadius: '6px',
                overflow: 'hidden',
              }}>
                <div
                  style={{
                    height: '100%',
                    width: '96.4%',
                    background: 'var(--success)',
                  }}
                />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                Projects delivered on schedule
              </p>
            </div>
          </div>

          <div className="admin-card">
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '700' }}>
              Client Satisfaction
            </h3>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--warning)', marginBottom: '0.5rem' }}>
                {avgSatisfaction}⭐
              </p>
              <div style={{
                height: '12px',
                background: 'var(--bg-secondary)',
                borderRadius: '6px',
                overflow: 'hidden',
              }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(parseFloat(avgSatisfaction) / 5) * 100}%`,
                    background: 'var(--warning)',
                  }}
                />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                Client satisfaction score
              </p>
            </div>
          </div>
        </div>

        {/* Team Performance Table */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Team Member Performance</h3>
            <select
              className="admin-btn admin-btn-secondary"
              value={String(sortBy)}
              onChange={(e) => setSortBy(e.target.value as keyof TeamMember)}
            >
              <option value="revenue">Sort by Revenue</option>
              <option value="projects">Sort by Projects</option>
              <option value="rating">Sort by Rating</option>
              <option value="utilization">Sort by Utilization</option>
              <option value="onTimeDelivery">Sort by On-Time Delivery</option>
            </select>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Role</th>
                <th>Projects</th>
                <th>Utilization</th>
                <th>Rating</th>
                <th>On-Time</th>
                <th>Revenue</th>
                <th>Satisfaction</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeam.map((member) => (
                <tr key={member.id}>
                  <td className="font-medium">{member.name}</td>
                  <td style={{ fontSize: '0.9rem' }}>{member.role}</td>
                  <td style={{ textAlign: 'center' }}>{member.projects}</td>
                  <td>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}>
                      <div style={{
                        height: '6px',
                        flex: 1,
                        background: 'var(--bg-secondary)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${member.utilization}%`,
                            background: member.utilization > 90 ? 'var(--success)' : 'var(--primary)',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                        {member.utilization}%
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ color: 'var(--warning)' }}>
                      {'⭐'.repeat(Math.round(member.rating))}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: '600' }}>
                    {member.onTimeDelivery}%
                  </td>
                  <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                    ${(member.revenue / 1000).toFixed(0)}K
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {member.satisfaction.toFixed(1)}⭐
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Performance Distribution */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          <div className="admin-card">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '700' }}>
              Performance Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { level: 'Excellent', count: 3, color: 'var(--success)' },
                { level: 'Good', count: 2, color: 'var(--primary)' },
                { level: 'Average', count: 0, color: 'var(--warning)' },
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>{item.level}</span>
                    <span style={{ fontWeight: '700' }}>{item.count}</span>
                  </div>
                  <div style={{
                    height: '12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                  }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(item.count / mockTeamData.length) * 100}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '700' }}>
              Revenue by Role
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {mockTeamData.map((member) => (
                <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{member.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{member.role}</p>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)' }}>
                    ${(member.revenue / 1000).toFixed(0)}K
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
