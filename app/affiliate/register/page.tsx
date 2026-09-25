"use client";

import { useState } from "react";

export default function AffiliateRegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/affiliate/register", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    alert(`Registration successful! Check ${formData.email} for verification link.`);
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-8">Become an Affiliate</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
      <p className="text-sm text-gray-600 mt-4 text-center">
        ✅ 10% Commission Rate<br/>
        ✅ Email Verification Required<br/>
        ✅ Real-time Earnings Tracking
      </p>
    </div>
  );
}
