import { useEffect, useState } from "react";
import { Search, Trash2, Users2, Shield } from "lucide-react";

export default function AdminCommunities() {
  const [communities, setCommunities] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/admin/communities", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Failed to load communities");
      setCommunities(data.communities);
      setFiltered(data.communities);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCommunities(); }, []);

  useEffect(() => {
    let list = [...communities];
    if (search.trim()) {
      list = list.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(list);
  }, [search, communities]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this community? This will also delete ALL posts in this community!")) return;
    setDeleting(id);
    try {
      const res = await fetch(`${(import.meta.env.VITE_BACKEND_URL || '').trim()}/api/admin/communities/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Failed to delete");
      setCommunities(prev => prev.filter(c => c._id !== id));
    } catch {
      alert("Network error");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Communities</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} active communities</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by community name or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

      {loading ? (
        <div className="py-24 text-center text-gray-400">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading communities...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Community</th>
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-left">Admin</th>
                  <th className="px-5 py-3 text-left">Members</th>
                  <th className="px-5 py-3 text-left">Created</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">No communities found</td></tr>
                ) : filtered.map((c) => (
                  <tr key={c._id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={c.image} alt="" className="w-10 h-10 rounded-full object-cover bg-gray-100 shadow-sm" />
                        <span className="font-semibold text-gray-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Shield size={12} className="text-amber-500" />
                        {c.adminId?.username || "System"}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Users2 size={14} />
                        {c.members?.length || 0}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleDelete(c._id)}
                        disabled={deleting === c._id}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Delete community"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
