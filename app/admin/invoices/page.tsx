"use client";

import { useState } from "react";

export default function InvoiceAdminPage() {
  const [invoices] = useState([
    { id: "1", number: "INV-001", billTo: "Customer 1", total: 1000, currency: "USD", language: "English", status: "sent" },
    { id: "2", number: "INV-002", billTo: "Customer 2", total: 2500, currency: "BDT", language: "Bengali", status: "draft" },
  ]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Invoice Management</h1>
      <button className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Create Invoice
      </button>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Invoice #</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Bill To</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Language</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Total</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{inv.number}</td>
                <td className="px-6 py-4">{inv.billTo}</td>
                <td className="px-6 py-4">{inv.language}</td>
                <td className="px-6 py-4">{inv.currency} {inv.total}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${inv.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
