'use client'

import { useEffect, useState } from 'react'

export default function AdminForecastingPage() {
  const [forecast, setForecast] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [metric, setMetric] = useState('revenue')

  useEffect(() => {
    loadForecast()
  }, [metric])

  const loadForecast = async () => {
    try {
      const res = await fetch(`/api/admin/analytics/forecasting?metric=${metric}&periods=7`)
      if (res.ok) {
        const data = await res.json()
        setForecast(data.data)
      }
    } catch (error) {
      console.error('Failed to load forecast:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Predictive Forecasting</h1>
      </div>

      <div className="admin-content">
        {/* Metric Selector */}
        <div className="admin-card" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Select Metric to Forecast</label>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="form-input"
          >
            <option value="revenue">Revenue</option>
            <option value="orders">Orders</option>
            <option value="conversions">Conversions</option>
            <option value="customers">New Customers</option>
            <option value="traffic">Website Traffic</option>
          </select>
        </div>

        {/* Forecast Card */}
        {loading ? (
          <div className="admin-card">
            <p style={{ color: 'var(--muted)' }}>Loading forecast...</p>
          </div>
        ) : forecast ? (
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
                  Model Accuracy
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
                  {forecast.accuracy}%
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Confidence Level
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {forecast.confidenceLevel}%
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Forecast Period
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>7 Days</div>
              </div>
            </div>

            {/* Forecast Chart */}
            <div className="admin-card">
              <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>
                {metric.charAt(0).toUpperCase() + metric.slice(1)} Forecast
              </h3>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '0.5rem',
                  height: '200px',
                  padding: '1rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  justifyContent: 'space-around',
                }}
              >
                {forecast.predictions && forecast.predictions.length > 0 ? (
                  forecast.predictions.slice(0, 7).map((pred: any, index: number) => {
                    const maxValue = Math.max(...forecast.predictions.map((p: any) => p.value))
                    const height = (pred.value / maxValue) * 150
                    return (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            height: `${height}px`,
                            width: '100%',
                            background: 'var(--primary)',
                            borderRadius: '4px 4px 0 0',
                            minHeight: '20px',
                          }}
                        />
                        <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--muted)' }}>
                          Day {index + 1}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p style={{ color: 'var(--muted)' }}>No predictions available</p>
                )}
              </div>

              {/* Prediction Table */}
              <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Predicted Value</th>
                      <th>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.predictions && forecast.predictions.slice(0, 7).map((pred: any, index: number) => (
                      <tr key={index}>
                        <td>{new Date(pred.date).toLocaleDateString()}</td>
                        <td className="font-mono">{pred.value.toFixed(2)}</td>
                        <td>
                          {index > 0 && forecast.predictions[index - 1] ? (
                            <span
                              style={{
                                color:
                                  pred.value > forecast.predictions[index - 1].value
                                    ? '#10B981'
                                    : '#EF4444',
                              }}
                            >
                              {pred.value > forecast.predictions[index - 1].value ? '📈' : '📉'}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="admin-card">
            <p style={{ color: 'var(--muted)' }}>Unable to load forecast</p>
          </div>
        )}

        {/* Info Card */}
        <div className="admin-card" style={{ marginTop: '1rem' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>About Forecasting</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
            Our predictive models analyze historical data to forecast future metric values.
          </p>
          <ul style={{ color: 'var(--muted)', paddingLeft: '1.5rem' }}>
            <li>Based on 30+ days of historical data</li>
            <li>Uses trend analysis and seasonal adjustments</li>
            <li>Provides 7-day forward forecasts</li>
            <li>Shows confidence intervals</li>
            <li>Updated daily with new data</li>
          </ul>
        </div>
      </div>
    </>
  )
}
