"use client";

import { useState } from "react";

export default function SchedulingPage() {
  const stats = {
    activeJobs: 12,
    completedTasks: 245,
    upcomingEvents: 8,
    activeWorkflows: 3,
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Scheduling & Automation</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Active Jobs" value={stats.activeJobs} icon="⚙️" />
        <StatCard title="Completed Tasks" value={stats.completedTasks} icon="✓" />
        <StatCard title="Upcoming Events" value={stats.upcomingEvents} icon="📅" />
        <StatCard title="Active Workflows" value={stats.activeWorkflows} icon="🔄" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureCard title="Cron Jobs" description="Automated background tasks" endpoint="/api/scheduling/jobs" />
        <FeatureCard title="Events" description="Schedule meetings and events" endpoint="/api/scheduling/events" />
        <FeatureCard title="Workflows" description="Multi-step automation" endpoint="/api/scheduling/workflows" />
        <FeatureCard title="Tasks" description="Task assignment and tracking" endpoint="/api/scheduling/tasks" />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm text-gray-600">{icon} {title}</p>
      <p className="text-4xl font-bold text-blue-600 mt-2">{value}</p>
    </div>
  );
}

function FeatureCard({ title, description, endpoint }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <p className="text-xs font-mono text-gray-500">{endpoint}</p>
    </div>
  );
}
