import { useEffect, useState } from "react";
import { Search, Trash2, ExternalLink, FileText, Activity } from "lucide-react";

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/admin/blogs", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Failed to load blogs");
      setBlogs(data.blogs);
      setFiltered(data.blogs);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  useEffect(() => {
    let list = [...blogs];
    if (search.trim()) {
      list = list.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase()) ||
        b.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(list);
  }, [search, blogs]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`${(import.meta.env.VITE_BACKEND_URL || '').trim()}/api/admin/blogs/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Failed to delete");
      setBlogs(prev => prev.filter(b => b._id !== id));
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
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 drop-shadow-sm tracking-tight">
            Expert Blogs
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Manage and moderate platform content.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white/80 backdrop-blur-md border border-emerald-100/50 p-4 rounded-2xl shadow-[0_4px_20px_-4px_rgba(16,185,129,0.1)] flex items-center gap-4 min-w-[160px] transform transition hover:-translate-y-1">
            <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-600 rounded-xl shadow-inner">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Blogs</p>
              <p className="text-2xl font-black text-gray-800">{filtered.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white/60 backdrop-blur-xl p-3 md:p-4 rounded-2xl border border-white/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-[26rem] group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search by title, author, or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200/80 bg-white/50 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all placeholder:text-gray-400 font-medium text-gray-700 shadow-inner"
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
          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin shadow-lg" />
          <p className="font-medium animate-pulse text-emerald-600/80">Loading brilliant articles...</p>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/50 text-xs text-gray-500 uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Cover</th>
                  <th className="px-6 py-4 text-left font-bold">Title & Content</th>
                  <th className="px-6 py-4 text-left font-bold">Author</th>
                  <th className="px-6 py-4 text-left font-bold">Category</th>
                  <th className="px-6 py-4 text-left font-bold">Date</th>
                  <th className="px-6 py-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="p-4 bg-gray-50 rounded-full">
                          <FileText size={32} className="text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-medium">No blogs found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((b) => (
                  <tr key={b._id} className="group hover:bg-emerald-50/30 transition-all duration-200">
                    <td className="px-6 py-4">
                      <img src={b.image} alt="" className="w-14 h-14 rounded-xl object-cover bg-gray-100 shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800 line-clamp-1 max-w-xs group-hover:text-emerald-700 transition-colors">{b.title}</div>
                      <div className="text-xs text-gray-400 mt-1 line-clamp-1 max-w-xs">An insightful read...</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-400 flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
                          {b.author.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-600">{b.author}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-100/50 rounded-lg text-xs font-bold tracking-wide shadow-sm">
                        {b.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs font-medium">
                      {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a href={`/blog#${b.slug}`} target="_blank" rel="noreferrer" className="p-2.5 text-blue-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100" title="View Blog">
                          <ExternalLink size={16} />
                        </a>
                        <button
                          onClick={() => handleDelete(b._id)}
                          disabled={deleting === b._id}
                          className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100 disabled:opacity-50"
                          title="Delete blog"
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
