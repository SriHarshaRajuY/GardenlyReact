import { useEffect, useState } from "react";
import { Search, CheckCircle, Clock } from "lucide-react";

const STATUS_COLORS = {
  Open: "bg-amber-100 text-amber-700",
  Resolved: "bg-emerald-100 text-emerald-700",
};

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [resolvingId, setResolvingId] = useState(null);
  const [resolution, setResolution] = useState("");
  const [resolveModal, setResolveModal] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/admin/tickets", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Failed to load tickets");
      setTickets(data.tickets);
      setFiltered(data.tickets);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  useEffect(() => {
    let list = [...tickets];
    if (statusFilter !== "All") list = list.filter(t => t.status === statusFilter);
    if (search.trim()) list = list.filter(t =>
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.requester?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(list);
  }, [search, statusFilter, tickets]);

  const handleResolve = async () => {
    if (!resolution.trim()) return alert("Please enter a resolution note");
    setResolvingId(resolveModal._id);
    try {
      const res = await fetch(`${(import.meta.env.VITE_BACKEND_URL || '').trim()}/api/admin/tickets/${resolveModal._id}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ resolution }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Failed to resolve");
      setTickets(prev => prev.map(t => t._id === resolveModal._id ? { ...t, status: "Resolved", resolution } : t));
      setResolveModal(null);
      setResolution("");
    } catch {
      alert("Network error");
    } finally {
      setResolvingId(null);
    }
  };

  const open = tickets.filter(t => t.status === "Open").length;
  const resolved = tickets.filter(t => t.status === "Resolved").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Support Tickets</h1>
        <p className="text-sm text-gray-500 mt-1">
          <span className="text-amber-600 font-semibold">{open} open</span>
          {" · "}
          <span className="text-green-600 font-semibold">{resolved} resolved</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by subject or user..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="All">All Status</option>
          <option value="Open">Open</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

      {loading ? (
        <div className="py-24 text-center text-gray-400">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading tickets...
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">No tickets found</div>
          ) : filtered.map((t) => (
            <div key={t._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[t.status] || "bg-gray-100 text-gray-600"}`}>
                      {t.status === "Open" ? <Clock className="w-3 h-3 inline mr-1" /> : <CheckCircle className="w-3 h-3 inline mr-1" />}
                      {t.status}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</span>
                    <span className="text-xs font-medium text-gray-500">
                      Type: <span className="capitalize">{t.type || "general"}</span>
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{t.subject}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{t.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    By: <span className="font-medium text-gray-600">{t.requester || "Unknown"}</span>
                    {t.expert_id && (
                      <span className="ml-2 text-purple-500">· Assigned to: {t.expert_id?.username}</span>
                    )}
                  </p>
                  {t.resolution && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                      <p className="text-xs font-semibold text-emerald-700 mb-1">✅ Resolution:</p>
                      <p className="text-xs text-emerald-600">{t.resolution}</p>
                    </div>
                  )}
                </div>
                {t.status === "Open" && (
                  <button
                    onClick={() => setResolveModal(t)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-xl hover:bg-green-700 transition font-medium flex-shrink-0"
                  >
                    <CheckCircle size={15} /> Resolve
                  </button>
                )}
              </div>
              {t.attachment && (
                <div className="mt-3">
                  <a href={t.attachment} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                    📎 View Attachment
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Resolve Ticket</h3>
            <p className="text-sm text-gray-500 mb-4">"{resolveModal.subject}"</p>
            <textarea
              value={resolution}
              onChange={e => setResolution(e.target.value)}
              rows={4}
              placeholder="Enter resolution note for the user..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleResolve}
                disabled={!!resolvingId}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                {resolvingId ? "Resolving..." : "Mark Resolved"}
              </button>
              <button
                onClick={() => { setResolveModal(null); setResolution(""); }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}