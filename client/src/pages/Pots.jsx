import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import ProductDetail from "../components/ProductDetail";

const API_URL = import.meta.env.DEV ? "" : "http://localhost:3000";

export default function Pots() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [detailProduct, setDetailProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  // ---------- FETCH ----------
  useEffect(() => {
    fetch(`${API_URL}/api/products/category/Pots`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const withRating = d.products.map(p => ({
            ...p,
            rating: Math.floor(Math.random() * 2) + 4   // 4-5 stars
          }));
          setProducts(withRating);
          setFiltered(withRating);
        }
      })
      .catch(() => setFiltered([]))
      .finally(() => setLoading(false));
  }, []);

  // ---------- FILTER / SORT ----------
  const applyFilters = () => {
    let list = [...products];

    // PRICE
    const priceChecks = document.querySelectorAll('.filter-price:checked');
    if (priceChecks.length) {
      const ranges = Array.from(priceChecks).map(c => c.value);
      list = list.filter(p => ranges.some(r => {
        if (r === '0-300') return p.price <= 300;
        if (r === '300-600') return p.price > 300 && p.price <= 600;
        return p.price > 600;
      }));
    }

    // AVAILABILITY
    const availChecks = document.querySelectorAll('.filter-availability:checked');
    if (availChecks.length) {
      const vals = Array.from(availChecks).map(c => c.value);
      list = list.filter(p => {
        if (vals.includes('inStock') && p.available > 0) return true;
        if (vals.includes('outOfStock') && p.available === 0) return true;
        return false;
      });
    }

    // RATING
    const ratingChecks = document.querySelectorAll('.filter-rating:checked');
    if (ratingChecks.length) {
      const mins = Array.from(ratingChecks).map(c => +c.value);
      list = list.filter(p => mins.some(m => p.rating >= m));
    }

    setFiltered(list);
    setShowFilter(false);
  };

  const sortProducts = (type) => {
    const sorted = [...filtered];
    if (type === 'low') sorted.sort((a, b) => a.price - b.price);
    else if (type === 'high') sorted.sort((a, b) => b.price - a.price);
    else if (type === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    else if (type === 'az') sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (type === 'za') sorted.sort((a, b) => b.name.localeCompare(a.name));
    setFiltered(sorted);
    setShowSort(false);
  };

  // ---------- RENDER ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pt-20">
      {/* Splash Banner */}
      <div className="bg-gradient-to-r from-emerald-400 to-green-600 text-white text-center py-20 px-4 rounded-b-3xl shadow-xl">
        <h2 className="text-4xl md:text-5xl font-bold mb-2">15% Off Sitewide</h2>
        <p className="text-lg">Min. purchase of ₹1499</p>
        <p className="mt-1">Use Code: <strong>SAVE15</strong></p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header + Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-4 rounded-xl shadow">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
            Pots
          </h1>

          <div className="flex gap-3 mt-4 md:mt-0 relative">
            <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-2 rounded-full shadow hover:shadow-lg transition"
                    onClick={() => (window.location.href = "/")}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              HOME
            </button>

            <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-2 rounded-full shadow hover:shadow-lg transition relative"
                    onClick={() => setShowFilter(!showFilter)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              FILTER
            </button>

            <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-2 rounded-full shadow hover:shadow-lg transition relative"
                    onClick={() => setShowSort(!showSort)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h10"/><path d="M11 8h7"/><path d="M11 12h4"/></svg>
              SORT BY
            </button>

            {/* ---- SORT MENU ---- */}
            {showSort && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl z-50 animate-fadeIn">
                <ul className="py-2">
                  {[
                    {id:'low', txt:'Price, low to high'},
                    {id:'high', txt:'Price, high to low'},
                    {id:'rating', txt:'Rating, high to low'},
                    {id:'az', txt:'Name, A to Z'},
                    {id:'za', txt:'Name, Z to A'},
                  ].map(o=>(
                    <li key={o.id} className="px-4 py-2 hover:bg-emerald-50 cursor-pointer"
                        onClick={()=>sortProducts(o.id)}>{o.txt}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ---- FILTER MENU ---- */}
            {showFilter && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl p-4 z-50 animate-fadeIn">
                <h3 className="font-semibold mb-3">Filters</h3>

                {/* PRICE */}
                <div className="mb-4">
                  <h4 className="font-medium mb-1">Price Range</h4>
                  {['0-300','300-600','600+'].map(v=>(
                    <label key={v} className="flex items-center gap-2 mb-1">
                      <input type="checkbox" className="filter-price" value={v} />
                      {v==='0-300' ? '₹0 - ₹300' : v==='300-600' ? '₹300 - ₹600' : '₹600+'}
                    </label>
                  ))}
                </div>

                {/* AVAILABILITY */}
                <div className="mb-4">
                  <h4 className="font-medium mb-1">Availability</h4>
                  <label className="flex items-center gap-2 mb-1">
                    <input type="checkbox" className="filter-availability" value="inStock" />
                    In Stock
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="filter-availability" value="outOfStock" />
                    Out of Stock
                  </label>
                </div>

                {/* RATING */}
                <div className="mb-4">
                  <h4 className="font-medium mb-1">Rating</h4>
                  {[5,4].map(v=>(
                    <label key={v} className="flex items-center gap-2 mb-1">
                      <input type="checkbox" className="filter-rating" value={v} />
                      {v===5 ? '5 Stars' : '4+ Stars'}
                    </label>
                  ))}
                </div>

                <button onClick={applyFilters}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-2 rounded-lg font-medium">
                  Apply Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PRODUCTS GRID */}
        {loading ? (
          <p className="text-center text-gray-600">Loading pots...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-600">No pots found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} onOpenDetail={setDetailProduct} />
            ))}
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {detailProduct && (
        <ProductDetail product={detailProduct} onClose={() => setDetailProduct(null)} />
      )}
    </div>
  );
}

/* tiny animation */
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.animate-fadeIn{animation:fadeIn .25s ease-out}
`;
document.head.appendChild(style);