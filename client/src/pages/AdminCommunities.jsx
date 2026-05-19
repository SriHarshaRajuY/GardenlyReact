import { useEffect, useState } from "react";
import { Search, Trash2, Users2, Shield, Activity } from "lucide-react";
import { getImageUrl } from "../utils/imageUrl";

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
    <div className="space-y-8 animate-fade-in-up">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 drop-shadow-sm tracking-tight">
            Communities
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Monitor active groups and membership.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white/80 backdrop-blur-md border border-blue-100/50 p-4 rounded-2xl shadow-[0_4px_20px_-4px_rgba(59,130,246,0.1)] flex items-center gap-4 min-w-[180px] transform transition hover:-translate-y-1">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-600 rounded-xl shadow-inner">
              <Users2 size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Active Groups</p>
              <p className="text-2xl font-black text-gray-800">{filtered.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white/60 backdrop-blur-xl p-3 md:p-4 rounded-2xl border border-white/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-[26rem] group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search by community name or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200/80 bg-white/50 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all placeholder:text-gray-400 font-medium text-gray-700 shadow-inner"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-2xl text-sm flex items-center gap-3">
          <Activity size={18} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center text-gray-400 space-y-4">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin shadow-lg" />
          <p className="font-medium animate-pulse text-blue-600/80">Loading communities...</p>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/50 text-xs text-gray-500 uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Community</th>
                  <th className="px-6 py-4 text-left font-bold">Category</th>
                  <th className="px-6 py-4 text-left font-bold">Admin</th>
                  <th className="px-6 py-4 text-left font-bold">Members</th>
                  <th className="px-6 py-4 text-left font-bold">Created</th>
                  <th className="px-6 py-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="p-4 bg-gray-50 rounded-full">
                          <Users2 size={32} className="text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-medium">No communities found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((c) => (
                  <tr key={c._id} className="group hover:bg-blue-50/30 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img src={getImageUrl(c.image, `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=eff6ff&color=3b82f6`)} alt={c.name} className="w-12 h-12 rounded-2xl object-cover bg-gray-100 shadow-sm border border-gray-100 group-hover:shadow-md transition-all group-hover:scale-105" />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors text-base">{c.name}</div>
                          <div className="text-xs text-gray-400 font-medium mt-0.5">{c.members?.length || 0} active gardeners</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100/50 rounded-lg text-xs font-bold tracking-wide shadow-sm">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 bg-gray-50/80 w-fit px-3 py-1.5 rounded-lg border border-gray-100">
                        <Shield size={14} className="text-amber-500 drop-shadow-sm" />
                        <span className="font-semibold text-xs">{c.adminId?.username || "System"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                        <Users2 size={16} className="text-gray-400" />
                        {c.members?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs font-medium">
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDelete(c._id)}
                          disabled={deleting === c._id}
                          className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100 disabled:opacity-50"
                          title="Delete community"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
