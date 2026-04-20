import { useEffect, useState } from "react";
import { Search, Trash2, BookOpen, ExternalLink } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Expert Blogs</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} blogs</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by title, author, or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

      {loading ? (
        <div className="py-24 text-center text-gray-400">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading blogs...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Image</th>
                  <th className="px-5 py-3 text-left">Title</th>
                  <th className="px-5 py-3 text-left">Author</th>
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">No blogs found</td></tr>
                ) : filtered.map((b) => (
                  <tr key={b._id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <img src={b.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800 line-clamp-1 max-w-xs">{b.title}</td>
                    <td className="px-5 py-3 text-gray-600">{b.author}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                        {b.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3 flex items-center gap-2">
                      <a href={`/blog#${b.slug}`} target="_blank" rel="noreferrer" className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="View Blog">
                        <ExternalLink size={15} />
                      </a>
                      <button
                        onClick={() => handleDelete(b._id)}
                        disabled={deleting === b._id}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Delete blog"
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
