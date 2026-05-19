import { useEffect, useState } from "react";
import { Search, Trash2, FileQuestion, Activity, CheckCircle2, Circle, XCircle, AlertCircle } from "lucide-react";

const STATUS_COLORS = {
  Open: "from-blue-50 to-sky-50 text-blue-700 border-blue-200/60",
  Confirmed: "from-emerald-50 to-green-50 text-emerald-700 border-emerald-200/60",
  Completed: "from-purple-50 to-fuchsia-50 text-purple-700 border-purple-200/60",
  Closed: "from-red-50 to-rose-50 text-red-700 border-red-200/60",
};

const STATUS_ICONS = {
  Open: <Circle size={12} className="text-blue-500 fill-blue-500" />,
  Confirmed: <CheckCircle2 size={12} className="text-emerald-500" />,
  Completed: <CheckCircle2 size={12} className="text-purple-500 fill-purple-200" />,
  Closed: <XCircle size={12} className="text-red-500" />
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
    <div className="space-y-8 animate-fade-in-up">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-500 drop-shadow-sm tracking-tight">
            Service Requests
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Manage buyer custom projects and gigs.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white/80 backdrop-blur-md border border-amber-100/50 p-4 rounded-2xl shadow-[0_4px_20px_-4px_rgba(245,158,11,0.1)] flex items-center gap-4 min-w-[180px] transform transition hover:-translate-y-1">
            <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-50 text-amber-600 rounded-xl shadow-inner">
              <FileQuestion size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Requests</p>
              <p className="text-2xl font-black text-gray-800">{filtered.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white/60 backdrop-blur-xl p-3 md:p-4 rounded-2xl border border-white/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-[26rem] group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400 group-focus-within:text-amber-500 transition-colors w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search by title, buyer, or status..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200/80 bg-white/50 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all placeholder:text-gray-400 font-medium text-gray-700 shadow-inner"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-2xl text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center text-gray-400 space-y-4">
          <div className="w-12 h-12 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin shadow-lg" />
          <p className="font-medium animate-pulse text-amber-600/80">Loading service requests...</p>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/50 text-xs text-gray-500 uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Project Details</th>
                  <th className="px-6 py-4 text-left font-bold">Buyer</th>
                  <th className="px-6 py-4 text-left font-bold">Budget</th>
                  <th className="px-6 py-4 text-left font-bold">Proposals</th>
                  <th className="px-6 py-4 text-left font-bold">Status</th>
                  <th className="px-6 py-4 text-left font-bold">Date</th>
                  <th className="px-6 py-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="p-4 bg-gray-50 rounded-full">
                          <FileQuestion size={32} className="text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-medium">No custom requests found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((r) => (
                  <tr key={r._id} className="group hover:bg-amber-50/30 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800 line-clamp-1 max-w-[200px] group-hover:text-amber-700 transition-colors">{r.title}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[200px] mt-0.5 font-medium">{r.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-700 bg-gray-100/80 px-3 py-1.5 rounded-lg border border-gray-200/50 shadow-sm">{r.buyer_id?.username || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                        ₹{r.budget || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-500 font-bold bg-gray-50 px-3 py-1.5 rounded-lg w-fit border border-gray-100">
                        <FileQuestion size={14} className="text-gray-400" />
                        {r.proposals?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide shadow-sm bg-gradient-to-r border ${STATUS_COLORS[r.status] || "from-gray-50 to-slate-50 text-gray-600 border-gray-200/60"}`}>
                        {STATUS_ICONS[r.status]}
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs font-medium">
                      {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDelete(r._id)}
                          disabled={deleting === r._id}
                          className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100 disabled:opacity-50"
                          title="Delete request"
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
