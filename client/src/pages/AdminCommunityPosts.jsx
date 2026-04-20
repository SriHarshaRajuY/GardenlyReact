import { useEffect, useState } from "react";
import { Search, Trash2, MessageSquare, Image as ImageIcon, Video } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Community Posts</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} posts across all communities</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by username, content, or community..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

      {loading ? (
        <div className="py-24 text-center text-gray-400">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading posts...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">User</th>
                  <th className="px-5 py-3 text-left">Community</th>
                  <th className="px-5 py-3 text-left">Content</th>
                  <th className="px-5 py-3 text-left">Media</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">No posts found</td></tr>
                ) : filtered.map((p) => (
                  <tr key={p._id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-800">{p.username}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[150px]">{p.userId?.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-medium text-indigo-600">
                        {p.communityId?.name || "Deleted Community"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-gray-600 line-clamp-2 max-w-md">{p.content}</p>
                    </td>
                    <td className="px-5 py-3">
                      {p.mediaType === "image" && (
                        <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-fit">
                          <ImageIcon size={14} />
                          <span className="text-xs font-medium">Image</span>
                        </div>
                      )}
                      {p.mediaType === "video" && (
                        <div className="flex items-center gap-1.5 text-purple-600 bg-purple-50 px-2 py-1 rounded-md w-fit">
                          <Video size={14} />
                          <span className="text-xs font-medium">Video</span>
                        </div>
                      )}
                      {p.mediaType === "none" && <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleDelete(p._id)}
                        disabled={deleting === p._id}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Delete post"
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
