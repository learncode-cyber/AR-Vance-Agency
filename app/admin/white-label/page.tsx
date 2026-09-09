"use client";

export default function WhiteLabelPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">White-Label Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Custom Branding" description="Logo, colors, fonts" endpoint="/api/white-label/branding" />
        <Card title="Theme Manager" description="Create custom themes" endpoint="/api/white-label/themes" />
        <Card title="Domain Mapping" description="Custom domains & SSL" endpoint="/api/white-label/domains" />
        <Card title="Reseller System" description="Commission & tracking" endpoint="/api/white-label/resellers" />
      </div>
    </div>
  );
}

function Card({ title, description, endpoint }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <p className="text-xs font-mono text-gray-500">{endpoint}</p>
    </div>
  );
}
