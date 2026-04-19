import { useEffect, useState } from "react";
import { Search, Trash2 } from "lucide-react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/admin/products", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Failed to load products");
      setProducts(data.products);
      setFiltered(data.products);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  useEffect(() => {
    let list = [...products];
    if (catFilter !== "All") list = list.filter(p => p.category === catFilter);
    if (search.trim()) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(list);
  }, [search, catFilter, products]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`${(import.meta.env.VITE_BACKEND_URL || '').trim()}/api/admin/products/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Failed to delete");
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch {
      alert("Network error");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <p className="text-sm text-gray-500 mt-1">{filtered.length} of {products.length} products</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

      {loading ? (
        <div className="py-24 text-center text-gray-400">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading products...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.length === 0 ? (
            <p className="col-span-full text-center text-gray-400 py-16">No products found</p>
          ) : filtered.map((p) => (
            <div key={p._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition group">
              <div className="relative h-44 overflow-hidden bg-gray-50">
                <img
                  src={p.image?.startsWith("http") ? p.image : `/images/${p.image}`}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  onError={(e) => (e.target.src = "/images/fallback.png")}
                />
                <button
                  onClick={() => handleDelete(p._id)}
                  disabled={deleting === p._id}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-red-600 disabled:opacity-50"
                  title="Delete product"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 line-clamp-1">{p.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{p.category}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-green-700 font-bold">₹{p.price}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.quantity > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {p.quantity > 0 ? `${p.quantity} in stock` : "Out of stock"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Seller: {p.seller_id?.username || "Unknown"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}