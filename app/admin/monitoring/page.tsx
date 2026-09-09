"use client";

import { useState, useEffect } from "react";
import { Recharts } from "recharts";

interface Stats {
  errors_30min: number;
  errors_24h: number;
  active_users: number;
  api_calls_24h: number;
  uptime_percentage: number;
  avg_response_time: number;
}

export default function MonitoringDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, alertsRes] = await Promise.all([
          fetch("/api/monitoring/stats"),
          fetch("/api/monitoring/alerts"),
        ]);

        const statsData = await statsRes.json();
        const alertsData = await alertsRes.json();

        setStats(statsData);
        setAlerts(alertsData);
      } catch (error) {
        console.error("Failed to fetch monitoring data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-8">Loading monitoring data...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">System Monitoring</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <MetricCard
          title="Errors (30m)"
          value={stats?.errors_30min || 0}
          color="text-red-600"
        />
        <MetricCard
          title="Errors (24h)"
          value={stats?.errors_24h || 0}
          color="text-orange-600"
        />
        <MetricCard
          title="Active Users"
          value={stats?.active_users || 0}
          color="text-blue-600"
        />
        <MetricCard
          title="API Calls (24h)"
          value={stats?.api_calls_24h || 0}
          color="text-green-600"
        />
        <MetricCard
          title="Uptime"
          value={`${stats?.uptime_percentage || 0}%`}
          color="text-emerald-600"
        />
        <MetricCard
          title="Avg Response Time"
          value={`${stats?.avg_response_time || 0}ms`}
          color="text-purple-600"
        />
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Active Alerts</h2>
        {alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map((alert: any) => (
              <div
                key={alert.id}
                className="p-4 border-l-4 border-yellow-500 bg-yellow-50"
              >
                <p className="font-semibold">{alert.message}</p>
                <p className="text-sm text-gray-600">
                  Type: {alert.type} | Severity: {alert.severity}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-green-600">✅ No active alerts</p>
        )}
      </div>

      {/* Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LinkCard href="/admin/monitoring/errors" title="Error Details" />
        <LinkCard href="/admin/monitoring/performance" title="Performance Metrics" />
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-600">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function LinkCard({ href, title }: { href: string; title: string }) {
  return (
    <a
      href={href}
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
    >
      <p className="font-semibold text-lg">{title}</p>
      <p className="text-blue-600">View Details →</p>
    </a>
  );
}
