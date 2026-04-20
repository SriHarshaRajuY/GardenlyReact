import { useEffect, useState } from "react";
import { Search, Trash2, FileQuestion, IndianRupee } from "lucide-react";

const STATUS_COLORS = {
  Open: "bg-blue-100 text-blue-700",
  Confirmed: "bg-emerald-100 text-emerald-700",
  Completed: "bg-gray-100 text-gray-700",
  Closed: "bg-red-100 text-red-700",
};

export default function AdminCustomRequests() {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/admin/custom-requests", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Failed to load requests");
      setRequests(data.requests);
      setFiltered(data.requests);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  useEffect(() => {
    let list = [...requests];
    if (search.trim()) {
      list = list.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.buyer_id?.username?.toLowerCase().includes(search.toLowerCase()) ||
        r.status.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(list);
  }, [search, requests]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this custom request?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`${(import.meta.env.VITE_BACKEND_URL || '').trim()}/api/admin/custom-requests/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Failed to delete");
      setRequests(prev => prev.filter(r => r._id !== id));
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
          <h1 className="text-2xl font-bold text-gray-800">Custom Service Requests</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} requests</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by title, buyer, or status..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

      {loading ? (
        <div className="py-24 text-center text-gray-400">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading requests...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Title</th>
                  <th className="px-5 py-3 text-left">Buyer</th>
                  <th className="px-5 py-3 text-left">Budget</th>
                  <th className="px-5 py-3 text-left">Proposals</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Created</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">No requests found</td></tr>
                ) : filtered.map((r) => (
                  <tr key={r._id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-800 line-clamp-1 max-w-[200px]">{r.title}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[200px]">{r.description}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-medium text-gray-700">{r.buyer_id?.username || "—"}</span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-green-700">
                      ₹{r.budget || 0}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <FileQuestion size={14} className="text-gray-400" />
                        {r.proposals?.length || 0}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-600"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleDelete(r._id)}
                        disabled={deleting === r._id}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Delete request"
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
