'use client'

import { useState } from 'react'

interface RevenueData {
  month: string
  revenue: number
  cost: number
  profit: number
  projectCount: number
}

const mockData: RevenueData[] = [
  { month: 'Jan', revenue: 45000, cost: 28000, profit: 17000, projectCount: 5 },
  { month: 'Feb', revenue: 52000, cost: 30000, profit: 22000, projectCount: 6 },
  { month: 'Mar', revenue: 58000, cost: 32000, profit: 26000, projectCount: 7 },
  { month: 'Apr', revenue: 65000, cost: 35000, profit: 30000, projectCount: 8 },
  { month: 'May', revenue: 71000, cost: 38000, profit: 33000, projectCount: 9 },
  { month: 'Jun', revenue: 78000, cost: 40000, profit: 38000, projectCount: 10 },
]

export default function RevenueReportPage() {
  const [period, setPeriod] = useState('6months')
  const [exportFormat, setExportFormat] = useState('pdf')

  const totalRevenue = mockData.reduce((sum, d) => sum + d.revenue, 0)
  const totalCost = mockData.reduce((sum, d) => sum + d.cost, 0)
  const totalProfit = totalRevenue - totalCost
  const profitMargin = (totalProfit / totalRevenue) * 100
  const avgProjectValue = totalRevenue / mockData.reduce((sum, d) => sum + d.projectCount, 0)
  const growthRate = ((mockData[mockData.length - 1].revenue - mockData[0].revenue) / mockData[0].revenue) * 100

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Revenue Report</h1>
        <select
          className="admin-btn admin-btn-secondary"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="6months">Last 6 Months</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="admin-content">
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="admin-card">
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
              Total Revenue
            </p>
            <p style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              ${(totalRevenue / 1000).toFixed(1)}K
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--success)' }}>
              +{growthRate.toFixed(1)}% growth
            </p>
          </div>

          <div className="admin-card">
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
              Total Costs
            </p>
            <p style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              ${(totalCost / 1000).toFixed(1)}K
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              {((totalCost / totalRevenue) * 100).toFixed(1)}% of revenue
            </p>
          </div>

          <div className="admin-card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#fff' }}>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>
              Net Profit
            </p>
            <p style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              ${(totalProfit / 1000).toFixed(1)}K
            </p>
            <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>
              {profitMargin.toFixed(1)}% margin
            </p>
          </div>

          <div className="admin-card">
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
              Avg Project Value
            </p>
            <p style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              ${(avgProjectValue / 1000).toFixed(1)}K
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              Based on {mockData.reduce((sum, d) => sum + d.projectCount, 0)} projects
            </p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '700' }}>
            Revenue Breakdown
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '1rem',
            height: '300px',
            padding: '1rem 0',
            borderBottom: '1px solid var(--border)',
            marginBottom: '1.5rem',
          }}>
            {mockData.map((data, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: `${(data.revenue / 80000) * 100}%`,
                    background: 'var(--primary)',
                    borderRadius: '4px 4px 0 0',
                  }}
                  title={`${data.month}: $${data.revenue}K`}
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{data.month}</p>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem' }}>
            {mockData.map((data, idx) => (
              <div key={idx}>
                <p style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  {data.month} {new Date().getFullYear()}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem' }}>
                  <p><span style={{ color: 'var(--muted)' }}>Revenue:</span> ${data.revenue}K</p>
                  <p><span style={{ color: 'var(--muted)' }}>Cost:</span> ${data.cost}K</p>
                  <p><span style={{ color: 'var(--primary)', fontWeight: '700' }}>Profit:</span> ${data.profit}K</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div className="admin-card">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '700' }}>
              Cost Breakdown
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Staff Costs', value: 40, percent: 40 },
                { label: 'Infrastructure', value: 25, percent: 25 },
                { label: 'Marketing', value: 20, percent: 20 },
                { label: 'Other', value: 15, percent: 15 },
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
                    <span style={{ fontWeight: '700' }}>{item.percent}%</span>
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
                        width: `${item.percent}%`,
                        background: `hsl(${idx * 60}, 70%, 50%)`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profit Trend */}
          <div className="admin-card">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '700' }}>
              Profit Margin Trend
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '0.75rem',
              height: '200px',
              padding: '1rem 0',
            }}>
              {mockData.map((data) => {
                const margin = ((data.profit / data.revenue) * 100)
                return (
                  <div
                    key={data.month}
                    style={{
                      flex: 1,
                      height: `${(margin / 60) * 100}%`,
                      background: 'var(--success)',
                      borderRadius: '4px',
                    }}
                    title={`${data.month}: ${margin.toFixed(1)}%`}
                  />
                )
              })}
            </div>
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
              Average Margin: {(profitMargin).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Export & Actions */}
        <div className="admin-card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>
            Export & Actions
          </h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <select
              className="admin-btn admin-btn-secondary"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <option value="pdf">Export as PDF</option>
              <option value="csv">Export as CSV</option>
              <option value="excel">Export as Excel</option>
            </select>
            <button className="admin-btn admin-btn-primary">
              📥 Download Report
            </button>
            <button className="admin-btn admin-btn-secondary">
              📧 Email Report
            </button>
            <button className="admin-btn admin-btn-secondary">
              🖨️ Print
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
