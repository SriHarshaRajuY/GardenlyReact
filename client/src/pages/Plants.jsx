// src/pages/Plants.jsx
import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import ProductDetail from "../components/ProductDetail";

export default function Plants() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [detailProduct, setDetailProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  const fetchPlants = (currentPage) => {
    setLoading(true);
    fetch(`${(import.meta.env.VITE_BACKEND_URL || '').trim()}/api/products/category/Plants?page=${currentPage}&limit=${limit}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        // Handle pagination response structure
        const items = d.products || (Array.isArray(d) ? d : []);
        setTotalPages(d.totalPages || 1);
        
        const withRating = items.map((p) => ({
          ...p,
          rating: Math.floor(Math.random() * 2) + 4,
          image: p.image || "/images/fallback.png",
        }));
        
        setProducts(withRating);
        setFiltered(withRating);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setFiltered([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPlants(page);
  }, [page]);

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  // FILTERS
  const applyFilters = () => {
    let list = [...products];

    const priceChecks = document.querySelectorAll(".filter-price:checked");
    if (priceChecks.length) {
      const ranges = Array.from(priceChecks).map((c) => c.value);
      list = list.filter((p) =>
        ranges.some((r) => {
          if (r === "0-300") return p.price <= 300;
          if (r === "300-600") return p.price > 300 && p.price <= 600;
          return p.price > 600;
        })
      );
    }

    const availChecks = document.querySelectorAll(".filter-availability:checked");
    if (availChecks.length) {
      const vals = Array.from(availChecks).map((c) => c.value);
      list = list.filter((p) => {
        if (vals.includes("inStock") && p.quantity > 0) return true;
        if (vals.includes("outOfStock") && p.quantity === 0) return true;
        return false;
      });
    }

    const ratingChecks = document.querySelectorAll(".filter-rating:checked");
    if (ratingChecks.length) {
      const mins = Array.from(ratingChecks).map((c) => +c.value);
      list = list.filter((p) => mins.some((m) => p.rating >= m));
    }

    setFiltered(list);
    setShowFilter(false);
  };

  // SORT
  const sortProducts = (type) => {
    const sorted = [...filtered];
    if (type === "low") sorted.sort((a, b) => a.price - b.price);
    else if (type === "high") sorted.sort((a, b) => b.price - a.price);
    else if (type === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else if (type === "az") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (type === "za") sorted.sort((a, b) => b.name.localeCompare(a.name));
    setFiltered(sorted);
    setShowSort(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pt-20">
      <div className="bg-gradient-to-r from-emerald-400 to-green-600 text-white text-center py-20 px-4 rounded-b-3xl shadow-xl">
        <h2 className="text-4xl md:text-5xl font-bold mb-2">15% Off Sitewide</h2>
        <p className="text-lg">Min. purchase of ₹1499</p>
        <p className="mt-1">
          Use Code: <strong>SAVE15</strong>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-4 rounded-xl shadow">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
            Plants
          </h1>

          <div className="flex gap-3 mt-4 md:mt-0 relative">
            <button
              onClick={() => (window.location.href = "/")}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-2 rounded-full shadow hover:shadow-lg transition"
            >
              Home
            </button>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-2 rounded-full shadow hover:shadow-lg transition"
            >
              Filter
            </button>
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-2 rounded-full shadow hover:shadow-lg transition"
            >
              Sort By
            </button>

            {showSort && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl z-50">
                <ul className="py-2">
                  {[
                    { id: "low", label: "Price, low to high" },
                    { id: "high", label: "Price, high to low" },
                    { id: "rating", label: "Rating, high to low" },
                    { id: "az", label: "Name, A to Z" },
                    { id: "za", label: "Name, Z to A" },
                  ].map((o) => (
                    <li
                      key={o.id}
                      className="px-4 py-2 hover:bg-emerald-50 cursor-pointer"
                      onClick={() => sortProducts(o.id)}
                    >
                      {o.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showFilter && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl p-4 z-50">
                <h3 className="font-semibold mb-3">Filters</h3>
                <div className="mb-4">
                  <h4 className="font-medium mb-1">Price Range</h4>
                  {["0-300", "300-600", "600+"].map((v) => (
                    <label key={v} className="flex items-center gap-2 mb-1">
                      <input type="checkbox" className="filter-price" value={v} />
                      {v === "0-300" ? "₹0 - ₹300" : v === "300-600" ? "₹300 - ₹600" : "₹600+"}
                    </label>
                  ))}
                </div>
                <div className="mb-4">
                  <h4 className="font-medium mb-1">Availability</h4>
                  <label className="flex items-center gap-2 mb-1">
                    <input type="checkbox" className="filter-availability" value="inStock" /> In Stock
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="filter-availability" value="outOfStock" /> Out of Stock
                  </label>
                </div>
                <div className="mb-4">
                  <h4 className="font-medium mb-1">Rating</h4>
                  {[5, 4].map((v) => (
                    <label key={v} className="flex items-center gap-2 mb-1">
                      <input type="checkbox" className="filter-rating" value={v} />
                      {v === 5 ? "5 Stars" : "4+ Stars"}
                    </label>
                  ))}
                </div>
                <button
                  onClick={applyFilters}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-2 rounded-lg font-medium"
                >
                  Apply Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Loading plants...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-600">No plants found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filtered.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onOpenDetail={setDetailProduct}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button 
                  onClick={handlePrevPage} 
                  disabled={page === 1}
                  className="px-6 py-2 bg-white border border-gray-300 rounded-full font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <span className="text-gray-700 font-medium">Page {page} of {totalPages}</span>
                <button 
                  onClick={handleNextPage} 
                  disabled={page === totalPages}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {detailProduct && (
        <ProductDetail
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
        />
      )}
    </div>
  );
}
