// src/pages/SearchResults.jsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "../components/ProductCard";

export default function SearchResults() {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.message || "Failed to search products");
          setResults([]);
        } else {
          setResults(data.products || []);
        }
      } catch (err) {
        setError("Network error while searching");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-white pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-2">
          Search results
        </h1>
        <p className="text-gray-600 mb-6 text-sm">
          {query
            ? `Showing results for "${query}"`
            : "Type something in the search box to find products."}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-green-700 text-sm">
            Searching…
          </div>
        ) : !query ? (
          <div className="py-20 text-center text-gray-500 text-sm">
            No search term provided.
          </div>
        ) : results.length === 0 ? (
          <div className="py-20 text-center text-gray-500 text-sm">
            No products found. Try a different keyword.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {results.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
