"use client";

import { useState, useEffect } from "react";

export default function AIAdminDashboard() {
  const [aiMetrics, setAiMetrics] = useState<any>({
    recommendations: 0,
    chatbotInteractions: 0,
    predictionsGenerated: 0,
    sentimentAnalyzed: 0,
  });

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch AI metrics
        const metricsRes = await fetch("/api/ai");
        const metricsData = await metricsRes.json();
        setAiMetrics(metricsData);

        // Fetch sample recommendations
        const recRes = await fetch("/api/ai/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "trending", limit: 5 }),
        });
        const recData = await recRes.json();
        setRecommendations(recData.recommendations || []);
      } catch (error) {
        console.error("Error fetching AI data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8">Loading AI Dashboard...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">AI & Analytics Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Recommendations Generated"
          value={aiMetrics.recommendations || 0}
          color="text-blue-600"
        />
        <MetricCard
          title="Chatbot Interactions"
          value={aiMetrics.chatbotInteractions || 0}
          color="text-green-600"
        />
        <MetricCard
          title="Predictions Made"
          value={aiMetrics.predictionsGenerated || 0}
          color="text-purple-600"
        />
        <MetricCard
          title="Texts Analyzed"
          value={aiMetrics.sentimentAnalyzed || 0}
          color="text-orange-600"
        />
      </div>

      {/* AI Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureCard
          title="AI Recommendations"
          description="Personalized product and content recommendations"
          endpoint="/api/ai/recommendations"
        />
        <FeatureCard
          title="Sentiment Analysis"
          description="Analyze text sentiment and emotions"
          endpoint="/api/ai/sentiment"
        />
        <FeatureCard
          title="Predictions"
          description="Predict churn, LTV, and conversions"
          endpoint="/api/ai/predictions"
        />
        <FeatureCard
          title="AI Chatbot"
          description="Enhanced chatbot with NLP capabilities"
          endpoint="/api/ai/chatbot"
        />
      </div>

      {/* Sample Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Sample Recommendations</h2>
          <div className="space-y-2">
            {recommendations.map((rec) => (
              <div key={rec.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="font-semibold">{rec.title}</p>
                <p className="text-sm text-gray-600">{rec.reason}</p>
                <p className="text-xs text-gray-500">Score: {(rec.score * 100).toFixed(0)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm text-gray-600">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
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
