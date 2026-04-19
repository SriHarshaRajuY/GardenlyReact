import { useEffect, useState } from "react";
import { Search, Trash2, Users } from "lucide-react";

const ROLE_COLORS = {
  Buyer: "bg-blue-100 text-blue-700",
  Seller: "bg-green-100 text-green-700",
  Admin: "bg-purple-100 text-purple-700",
  Expert: "bg-orange-100 text-orange-700",
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [deleting, setDeleting] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/admin/users", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Failed to load users");
      setUsers(data.users);
      setFiltered(data.users);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    let list = [...users];
    if (roleFilter !== "All") list = list.filter(u => u.role === roleFilter);
    if (search.trim()) list = list.filter(u =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(list);
  }, [search, roleFilter, users]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`${(import.meta.env.VITE_BACKEND_URL || '').trim()}/api/admin/users/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Failed to delete");
      setUsers(prev => prev.filter(u => u._id !== id));
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
          <h1 className="text-2xl font-bold text-gray-800">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} of {users.length} users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          {["All", "Buyer", "Seller", "Expert", "Admin"].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

      {loading ? (
        <div className="py-24 text-center text-gray-400">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading users...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left">Username</th>
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">Mobile</th>
                  <th className="px-5 py-3 text-left">Role</th>
                  <th className="px-5 py-3 text-left">Expertise</th>
                  <th className="px-5 py-3 text-left">Joined</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400">No users found</td></tr>
                ) : filtered.map((u, i) => (
                  <tr key={u._id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">
                          {u.username?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{u.mobile}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[u.role] || "bg-gray-100 text-gray-600"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{u.expertise || "—"}</td>
                    <td className="px-5 py-3 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleDelete(u._id)}
                        disabled={deleting === u._id}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Delete user"
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