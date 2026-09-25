"use client";

import { useState, useEffect } from "react";

export default function AffiliateDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalEarnings: 5000,
    pendingEarnings: 1200,
    totalReferrals: 45,
    conversionRate: 8.5,
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Affiliate Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total Earnings" value={`$${metrics.totalEarnings}`} />
        <MetricCard title="Pending Earnings" value={`$${metrics.pendingEarnings}`} />
        <MetricCard title="Total Referrals" value={metrics.totalReferrals} />
        <MetricCard title="Conversion Rate" value={`${metrics.conversionRate}%`} />
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Your Affiliate Link</h2>
        <p className="font-mono bg-gray-100 p-4 rounded">
          https://example.com?aff=YOUR-AFFILIATE-CODE
        </p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Copy Link
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Payment Methods</h2>
        <select className="w-full px-4 py-2 border rounded mb-4">
          <option>Bank Transfer</option>
          <option>PayPal</option>
          <option>Stripe</option>
          <option>Bitcoin</option>
          <option>Ethereum</option>
        </select>
        <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Request Payout ($100+ minimum)
        </button>
      </div>
    </div>
  );
}

function MetricCard({ title, value }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-3xl font-bold text-blue-600 mt-2">{value}</p>
    </div>
  );
}
