import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Users, ShoppingBag, IndianRupee, Package, AlertCircle,
  CheckCircle2, ClipboardList, RefreshCcw, UserCheck, UserCog, Leaf,
  TrendingUp, BarChart3, BookOpen, Users2, MessageSquare, FileQuestion
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentBuyers, setRecentBuyers] = useState([]);
  const [recentSellers, setRecentSellers] = useState([]);
  const [recentExperts, setRecentExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) navigate("/signin");
    else if (user.role !== "admin") navigate("/");
  }, [user, navigate]);

  const loadDashboard = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError("");
    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/admin/dashboard", { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to load dashboard");
      } else {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setRecentProducts(data.recentProducts || []);
        setRecentBuyers(data.recentBuyers || []);
        setRecentSellers(data.recentSellers || []);
        setRecentExperts(data.recentExperts || []);
      }
    } catch {
      setError("Network error. Is the server running?");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard(true);
    const id = setInterval(() => { setRefreshing(true); loadDashboard(false); }, 30000);
    return () => clearInterval(id);
  }, []);

  if (!user || user.role !== "admin") return null;

  const s = stats;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Live data from database • Auto-refreshes every 30s</p>
        </div>
        <button
          onClick={() => { setRefreshing(true); loadDashboard(false); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium text-sm transition shadow-sm"
        >
          <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}

      {loading && !s ? (
        <div className="py-32 text-center text-gray-500">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          Loading dashboard...
        </div>
      ) : s && (
        <>
          {/* KPI Cards */}
          <div className="grid gap-5 grid-cols-2 md:grid-cols-4">
            <KpiCard icon={Users} label="Total Users" value={s.users.total} color="bg-blue-500" sub={`${s.users.buyers} buyers`} />
            <KpiCard icon={Leaf} label="Sellers" value={s.users.sellers} color="bg-green-500" />
            <KpiCard icon={Package} label="Products" value={s.products.total} color="bg-purple-500" />
            <KpiCard icon={IndianRupee} label="Revenue" value={`₹${s.orders.revenue.toFixed(0)}`} color="bg-orange-500" sub="Admin commission" />
          </div>

          {/* New Model Cards */}
          <div className="grid gap-5 grid-cols-2 md:grid-cols-4">
            <KpiCard icon={BookOpen} label="Total Blogs" value={s.blogs.total} color="bg-cyan-500" />
            <KpiCard icon={Users2} label="Communities" value={s.communities.total} color="bg-emerald-500" />
            <KpiCard icon={MessageSquare} label="Comm. Posts" value={s.posts.total} color="bg-indigo-500" />
            <KpiCard icon={FileQuestion} label="Custom Req." value={s.customRequests.total} color="bg-rose-500" />
          </div>

          {/* Order Status Cards */}
          <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
            <StatusCard icon={ShoppingBag} label="Total Orders" value={s.orders.total} bg="bg-indigo-50" border="border-indigo-200" text="text-indigo-700" />
            <StatusCard icon={AlertCircle} label="Pending Orders" value={s.orders.pending} bg="bg-amber-50" border="border-amber-200" text="text-amber-700" />
            <StatusCard icon={CheckCircle2} label="Confirmed Orders" value={s.orders.confirmed} bg="bg-emerald-50" border="border-emerald-200" text="text-emerald-700" />
          </div>

          {/* Tickets & Users stats */}
          <div className="grid gap-5 grid-cols-2 md:grid-cols-4">
            <MiniCard label="Open Tickets" value={s.tickets.open} color="text-red-600" />
            <MiniCard label="Resolved Tickets" value={s.tickets.resolved} color="text-green-600" />
            <MiniCard label="Experts" value={s.users.experts} color="text-purple-600" />
            <MiniCard label="Admins" value={s.users.admins} color="text-blue-600" />
          </div>

          {/* Recent Products */}
          <Section title="Recently Added Products" icon={Package}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {recentProducts.length === 0 ? (
                <p className="col-span-full text-center text-gray-400 py-8">No products yet</p>
              ) : recentProducts.map((p) => (
                <div key={p._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                  <div className="h-36 overflow-hidden bg-gray-50">
                    <img
                      src={p.image?.startsWith("http") ? p.image : `/images/${p.image}`}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => (e.target.src = "/images/fallback.png")}
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm line-clamp-1">{p.name}</h4>
                    <p className="text-green-600 font-bold text-sm">₹{p.price}</p>
                    <p className="text-xs text-gray-400">Stock: {p.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Recent Orders */}
          <Section title="Recent Orders" icon={ShoppingBag}>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-5 py-3 text-left">Order ID</th>
                    <th className="px-5 py-3 text-left">Customer</th>
                    <th className="px-5 py-3 text-left">Amount</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No orders yet</td></tr>
                  ) : recentOrders.map((o) => (
                    <tr key={o._id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">{o._id.slice(-8).toUpperCase()}</td>
                      <td className="px-5 py-3 font-medium">{o.userId?.username || "—"}</td>
                      <td className="px-5 py-3 font-semibold text-green-700">₹{o.totalAmount}</td>
                      <td className="px-5 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${o.status === "confirmed" ? "bg-emerald-100 text-emerald-700" : o.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Recent Users */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Section title="Recent Buyers" icon={UserCheck}>
              <MiniUserTable users={recentBuyers} />
            </Section>
            <Section title="Recent Sellers" icon={Leaf}>
              <MiniUserTable users={recentSellers} />
            </Section>
          </div>

          <Section title="Recent Experts" icon={UserCog}>
            <MiniUserTable users={recentExperts} showExpertise />
          </Section>
        </>
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function StatusCard({ icon: Icon, label, value, bg, border, text }) {
  return (
    <div className={`${bg} ${border} border rounded-xl p-4 flex items-center gap-4`}>
      <Icon className={`w-8 h-8 ${text}`} />
      <div>
        <p className={`text-xs uppercase tracking-wide ${text} opacity-75`}>{label}</p>
        <p className={`text-2xl font-bold ${text}`}>{value}</p>
      </div>
    </div>
  );
}

function MiniCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-gray-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function MiniUserTable({ users, showExpertise = false }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
          <tr>
            <th className="px-4 py-3 text-left">Username</th>
            <th className="px-4 py-3 text-left">Email</th>
            {showExpertise && <th className="px-4 py-3 text-left">Expertise</th>}
            <th className="px-4 py-3 text-left">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr><td colSpan={showExpertise ? 4 : 3} className="px-4 py-6 text-center text-gray-400">No records yet</td></tr>
          ) : users.map((u) => (
            <tr key={u._id} className="border-t border-gray-50 hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{u.username}</td>
              <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
              {showExpertise && <td className="px-4 py-3 text-xs">{u.expertise || "General"}</td>}
              <td className="px-4 py-3 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}