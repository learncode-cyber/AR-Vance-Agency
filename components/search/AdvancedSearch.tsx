"use client";

import { useState } from "react";

export default function AdvancedSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          filters: selectedFilters,
          limit: 20,
        }),
      });

      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 px-4 py-2 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Results */}
      <div className="space-y-4">
        {results.map((result) => (
          <div key={result.id} className="border p-4 rounded hover:shadow-lg transition">
            <h3 className="font-bold text-lg">{result.title || result.name}</h3>
            <p className="text-gray-600 text-sm">
              {result.content || result.description}
            </p>
            <div className="flex gap-2 mt-2">
              {result.tags?.map((tag: string) => (
                <span key={tag} className="text-xs bg-gray-200 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}

        {results.length === 0 && !loading && query && (
          <p className="text-gray-500 text-center">No results found</p>
        )}
      </div>
    </div>
  );
}
