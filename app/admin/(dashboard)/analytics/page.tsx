'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Analytics {
  totalRevenue: number
  totalProjects: number
  totalClients: number
  averageProjectValue: number
  monthlyRevenue: Array<{ month: string; revenue: number }>
  projectStatus: Array<{ status: string; count: number }>
  topClients: Array<{ name: string; spent: number }>
  projectMetrics: Array<{ name: string; roi: number; satisfaction: number }>
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('12m')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/admin/analytics?range=${dateRange}`)
        if (res.ok) {
          const data = await res.json()
          setAnalytics(data.data)
        }
      } catch (error) {
        console.error('Failed to load analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [dateRange])

  if (loading) {
    return <div className="admin-content">Loading analytics...</div>
  }

  if (!analytics) {
    return <div className="admin-content">Failed to load analytics</div>
  }

  const statusColors: any = {
    active: '#10B981',
    completed: '#3B82F6',
    'on-hold': '#F59E0B',
    archived: '#EF4444',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Analytics Dashboard</h1>
        <select
          className="form-input"
          style={{ width: '150px' }}
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="3m">Last 3 Months</option>
          <option value="6m">Last 6 Months</option>
          <option value="12m">Last 12 Months</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="admin-content">
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="admin-card">
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Total Revenue</p>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
              ${analytics.totalRevenue.toLocaleString()}
            </p>
          </div>

          <div className="admin-card">
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Total Projects</p>
            <p style={{ fontSize: '2rem', fontWeight: '700' }}>{analytics.totalProjects}</p>
          </div>

          <div className="admin-card">
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Active Clients</p>
            <p style={{ fontSize: '2rem', fontWeight: '700' }}>{analytics.totalClients}</p>
          </div>

          <div className="admin-card">
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Avg Project Value</p>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
              ${analytics.averageProjectValue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Monthly Revenue */}
          <div className="admin-card">
            <h3 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--primary)" 
                  strokeWidth={2}
                  dot={{ fill: 'var(--primary)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Project Status Distribution */}
          <div className="admin-card">
            <h3 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>Project Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.projectStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.status}: ${entry.count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.projectStatus.map((entry) => (
                    <Cell key={`cell-${entry.status}`} fill={statusColors[entry.status] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} projects`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROI vs Satisfaction */}
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>Project Performance: ROI vs Satisfaction</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={analytics.projectMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted)" />
              <YAxis stroke="var(--muted)" />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
              <Legend />
              <Bar dataKey="roi" fill="var(--primary)" name="ROI (%)" />
              <Bar dataKey="satisfaction" fill="#10B981" name="Satisfaction (0-5)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Clients */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="admin-card">
            <h3 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>Top Clients by Spending</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analytics.topClients.map((client, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                  <div>
                    <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{client.name}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Client Rank #{i + 1}</p>
                  </div>
                  <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)' }}>
                    ${client.spent.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="admin-card">
            <h3 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>Quick Statistics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Avg Client Spend</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  ${(analytics.topClients.reduce((sum, c) => sum + c.spent, 0) / (analytics.topClients.length || 1)).toLocaleString()}
                </p>
              </div>

              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Completion Rate</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {Math.round((analytics.projectStatus.find(s => s.status === 'completed')?.count || 0) / analytics.totalProjects * 100) || 0}%
                </p>
              </div>

              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Revenue per Project</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  ${(analytics.totalRevenue / (analytics.totalProjects || 1)).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button className="admin-btn admin-btn-primary">
            📥 Download PDF Report
          </button>
          <button className="admin-btn admin-btn-secondary">
            📊 Download Excel Data
          </button>
          <button className="admin-btn admin-btn-secondary">
            📧 Email Report
          </button>
        </div>
      </div>
    </>
  )
}
