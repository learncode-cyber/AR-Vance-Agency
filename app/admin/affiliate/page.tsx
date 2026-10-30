"use client";

import { useState } from "react";

export default function AffiliateAdminPage() {
  const [affiliates] = useState([
    { id: "1", name: "John Doe", email: "john@example.com", status: "active", earnings: 5000 },
    { id: "2", name: "Jane Smith", email: "jane@example.com", status: "pending", earnings: 0 },
  ]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Affiliate Management</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Earnings</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {affiliates.map((aff) => (
              <tr key={aff.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{aff.name}</td>
                <td className="px-6 py-4">{aff.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${aff.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {aff.status}
                  </span>
                </td>
                <td className="px-6 py-4">${aff.earnings}</td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:underline text-sm">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
