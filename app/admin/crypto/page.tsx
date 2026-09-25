"use client";

import { useState } from "react";

export default function CryptoPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Cryptocurrency Payments</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card title="Bitcoin" value="$45,000" change="+2.5%" />
        <Card title="Ethereum" value="$2,500" change="+1.8%" />
        <Card title="USDC" value="$1.00" change="0.0%" />
        <Card title="USDT" value="$1.00" change="0.0%" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Feature
          title="Wallet Management"
          description="Create and manage crypto wallets"
          endpoint="/api/crypto/wallets"
        />
        <Feature
          title="Crypto Payments"
          description="Accept Bitcoin, Ethereum, Stablecoins"
          endpoint="/api/crypto/payments"
        />
        <Feature
          title="Price Feeds"
          description="Real-time crypto prices"
          endpoint="/api/crypto/prices"
        />
        <Feature
          title="Transactions"
          description="View transaction history"
          endpoint="/api/crypto/transactions"
        />
      </div>
    </div>
  );
}

function Card({ title, value, change }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-3xl font-bold text-blue-600 mt-2">{value}</p>
      <p className={`text-sm mt-2 ${change.includes("+") ? "text-green-600" : "text-red-600"}`}>
        {change}
      </p>
    </div>
  );
}

function Feature({ title, description, endpoint }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <p className="text-xs font-mono text-gray-500">{endpoint}</p>
    </div>
  );
}
