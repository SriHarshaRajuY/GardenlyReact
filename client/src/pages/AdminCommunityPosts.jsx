import { useEffect, useState } from "react";
import { Search, Trash2, MessageSquare, Image as ImageIcon, Video, Activity } from "lucide-react";

export default function AdminCommunityPosts() {
  const [posts, setPosts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/admin/posts", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Failed to load posts");
      setPosts(data.posts);
      setFiltered(data.posts);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  useEffect(() => {
    let list = [...posts];
    if (search.trim()) {
      list = list.filter(p =>
        p.username.toLowerCase().includes(search.toLowerCase()) ||
        p.content.toLowerCase().includes(search.toLowerCase()) ||
        p.communityId?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(list);
  }, [search, posts]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`${(import.meta.env.VITE_BACKEND_URL || '').trim()}/api/admin/posts/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Failed to delete");
      setPosts(prev => prev.filter(p => p._id !== id));
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
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-purple-600 drop-shadow-sm tracking-tight">
            Community Posts
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Moderate discussions and media content.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white/80 backdrop-blur-md border border-fuchsia-100/50 p-4 rounded-2xl shadow-[0_4px_20px_-4px_rgba(217,70,239,0.1)] flex items-center gap-4 min-w-[180px] transform transition hover:-translate-y-1">
            <div className="p-3 bg-gradient-to-br from-fuchsia-100 to-purple-50 text-fuchsia-600 rounded-xl shadow-inner">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Posts</p>
              <p className="text-2xl font-black text-gray-800">{filtered.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white/60 backdrop-blur-xl p-3 md:p-4 rounded-2xl border border-white/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-[26rem] group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400 group-focus-within:text-fuchsia-500 transition-colors w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search by username, content, or community..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200/80 bg-white/50 text-sm focus:outline-none focus:ring-4 focus:ring-fuchsia-500/10 focus:border-fuchsia-400 transition-all placeholder:text-gray-400 font-medium text-gray-700 shadow-inner"
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
          <div className="w-12 h-12 border-4 border-fuchsia-100 border-t-fuchsia-500 rounded-full animate-spin shadow-lg" />
          <p className="font-medium animate-pulse text-fuchsia-600/80">Loading conversations...</p>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/50 text-xs text-gray-500 uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Author</th>
                  <th className="px-6 py-4 text-left font-bold">Community</th>
                  <th className="px-6 py-4 text-left font-bold w-1/3">Content Preview</th>
                  <th className="px-6 py-4 text-left font-bold">Media</th>
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
                          <MessageSquare size={32} className="text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-medium">No posts found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((p) => (
                  <tr key={p._id} className="group hover:bg-fuchsia-50/30 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fuchsia-400 to-purple-400 flex items-center justify-center text-white font-bold shadow-sm">
                          {p.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{p.username}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[150px] font-medium">{p.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                        {p.communityId?.name || "Deleted Community"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 line-clamp-2 text-sm font-medium leading-relaxed">{p.content}</p>
                    </td>
                    <td className="px-6 py-4">
                      {p.mediaType === "image" && (
                        <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg w-fit border border-blue-100/50 shadow-sm">
                          <ImageIcon size={14} />
                          <span className="text-xs font-bold tracking-wide">IMAGE</span>
                        </div>
                      )}
                      {p.mediaType === "video" && (
                        <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg w-fit border border-rose-100/50 shadow-sm">
                          <Video size={14} />
                          <span className="text-xs font-bold tracking-wide">VIDEO</span>
                        </div>
                      )}
                      {p.mediaType === "none" && <span className="text-gray-300 font-bold tracking-widest">—</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs font-medium">
                      {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDelete(p._id)}
                          disabled={deleting === p._id}
                          className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100 disabled:opacity-50"
                          title="Delete post"
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
