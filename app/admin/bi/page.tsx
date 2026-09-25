"use client";

import { useState, useEffect } from "react";

export default function BIDashboard() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 125500,
    totalOrders: 342,
    totalCustomers: 189,
    avgOrderValue: 366.86,
  });

  const [dashboards, setDashboards] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/bi/dashboards");
        const data = await res.json();
        setDashboards(data.dashboards || []);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Business Intelligence Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total Revenue" value={`$${metrics.totalRevenue.toLocaleString()}`} />
        <MetricCard title="Total Orders" value={metrics.totalOrders} />
        <MetricCard title="Total Customers" value={metrics.totalCustomers} />
        <MetricCard title="Avg Order Value" value={`$${metrics.avgOrderValue.toFixed(2)}`} />
      </div>

      {/* BI Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureCard
          title="Executive Dashboard"
          description="High-level KPIs and business metrics"
          endpoint="/api/bi/dashboards"
        />
        <FeatureCard
          title="Analytics Engine"
          description="Revenue, customer, and product analytics"
          endpoint="/api/bi/analytics"
        />
        <FeatureCard
          title="Report Generator"
          description="Custom reports in PDF, Excel, CSV"
          endpoint="/api/bi/reports"
        />
        <FeatureCard
          title="Data Export"
          description="Export dashboards and reports"
          endpoint="/api/bi/export"
        />
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm text-gray-600 mb-2">{title}</p>
      <p className="text-3xl font-bold text-blue-600">{value}</p>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  endpoint,
}: {
  title: string;
  description: string;
  endpoint: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <p className="text-xs font-mono text-gray-500">{endpoint}</p>
    </div>
  );
}
