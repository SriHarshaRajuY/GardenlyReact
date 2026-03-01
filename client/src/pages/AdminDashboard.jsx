// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ShoppingBag,
  IndianRupee,
  Package,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  RefreshCcw,
  UserCheck,
  UserCog,
  Leaf,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentBuyers, setRecentBuyers] = useState([]);
  const [recentSellers, setRecentSellers] = useState([]);
  const [recentExperts, setRecentExperts] = useState([]);
  const [recentAdmins, setRecentAdmins] = useState([]);

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
      const res = await fetch("/api/admin/dashboard", { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to load dashboard");
      } else {
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
        setRecentProducts(data.recentProducts);
        setRecentBuyers(data.recentBuyers);
        setRecentSellers(data.recentSellers);
        setRecentExperts(data.recentExperts);
        setRecentAdmins(data.recentAdmins);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard(true);
    const id = setInterval(() => {
      setRefreshing(true);
      loadDashboard(false);
    }, 30000);
    return () => clearInterval(id);
  }, []);

  if (!user || user.role !== "admin") return null;

  const s = stats;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-green-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Live data from database • Users separated by role</p>
          </div>
          <button
            onClick={() => { setRefreshing(true); loadDashboard(false); }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-green-500 text-green-700 hover:bg-green-50 font-medium"
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">{error}</div>}

        {loading && !s ? (
          <div className="py-32 text-center text-green-700 text-lg">Loading live dashboard...</div>
        ) : (
          s && (
            <>
              {/* KPI Cards */}
              <div className="grid gap-6 md:grid-cols-5 mb-10">
                <StatCard icon={Users} label="Total Users" value={s.users.total} sub="All roles" />
                <StatCard icon={UserCheck} label="Buyers" value={s.users.buyers} />
                <StatCard icon={Leaf} label="Sellers" value={s.users.sellers} />
                <StatCard icon={UserCog} label="Experts" value={s.users.experts} />
                <StatCard icon={IndianRupee} label="Revenue" value={`₹${s.orders.revenue.toFixed(2)}`} />
              </div>

              {/* Status Cards */}
              <div className="grid gap-6 md:grid-cols-3 mb-12">
                <MiniStat icon={AlertCircle} label="Pending Orders" value={s.orders.pending} color="bg-amber-50 border-amber-200 text-amber-700" />
                <MiniStat icon={CheckCircle2} label="Confirmed Orders" value={s.orders.confirmed} color="bg-emerald-50 border-emerald-200 text-emerald-700" />
                <MiniStat icon={ClipboardList} label="Open Tickets" value={s.tickets.open} color="bg-sky-50 border-sky-200 text-sky-700" sub={`${s.tickets.resolved} resolved`} />
              </div>

              {/* USERS - SEPARATED BY ROLE */}
              <Section title="Recent Buyers" icon={UserCheck}>
                <UserTable users={recentBuyers} />
              </Section>

              <Section title="Recent Sellers" icon={Leaf}>
                <UserTable users={recentSellers} />
              </Section>

              <Section title="Recent Experts" icon={UserCog}>
                <UserTable users={recentExperts} showExpertise />
              </Section>

              <Section title="Recent Admins" icon={UserCog}>
                <UserTable users={recentAdmins} />
              </Section>

              {/* PRODUCTS & ORDERS */}
              <Section title="Recent Products (Newest First)" icon={Package}>
                <ProductGrid products={recentProducts} />
              </Section>

              <Section title="Recent Orders" icon={ShoppingBag}>
                <OrderTable orders={recentOrders} />
              </Section>
            </>
          )
        )}
      </div>
    </div>
  );
}

/* ====================== REUSABLE COMPONENTS ====================== */
function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-green-800 mt-1">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-green-600" />
        </div>
      </div>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, sub, color }) {
  return (
    <div className={`rounded-2xl border p-4 flex items-center gap-4 ${color}`}>
      <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
        {sub && <p className="text-xs opacity-80 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-green-700" />
        </div>
        <h2 className="text-2xl font-bold text-green-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function UserTable({ users, showExpertise = false }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-green-50">
          <tr>
            <th className="px-5 py-3 text-left">Username</th>
            <th className="px-5 py-3 text-left">Email</th>
            <th className="px-5 py-3 text-left">Mobile</th>
            {showExpertise && <th className="px-5 py-3 text-left">Expertise</th>}
            <th className="px-5 py-3 text-left">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr><td colSpan={showExpertise ? 5 : 4} className="px-5 py-8 text-center text-gray-500">No records yet</td></tr>
          ) : (
            users.map((u) => (
              <tr key={u._id} className="border-t border-gray-100 hover:bg-green-50/50">
                <td className="px-5 py-3 font-medium">{u.username}</td>
                <td className="px-5 py-3">{u.email}</td>
                <td className="px-5 py-3 text-xs font-mono">{u.mobile}</td>
                {showExpertise && <td className="px-5 py-3">{u.expertise || "General"}</td>}
                <td className="px-5 py-3 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {products.length === 0 ? (
        <p className="col-span-full text-center text-gray-500 py-8">No products yet</p>
      ) : (
        products.map((p) => (
          <div key={p._id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition">
            <img src={p.image?.startsWith("/") ? p.image : `/images/${p.image}`} alt={p.name} className="w-full h-40 object-cover" onError={(e) => (e.target.src = "/images/fallback.png")} />
            <div className="p-4">
              <h4 className="font-semibold line-clamp-1">{p.name}</h4>
              <p className="text-green-600 font-bold">₹{p.price}</p>
              <p className="text-xs text-gray-500">Stock: {p.quantity}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function OrderTable({ orders }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-green-50">
          <tr>
            <th className="px-5 py-3 text-left">Order ID</th>
            <th className="px-5 py-3 text-left">Customer</th>
            <th className="px-5 py-3 text-left">Amount</th>
            <th className="px-5 py-3 text-left">Status</th>
            <th className="px-5 py-3 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-500">No orders yet</td></tr>
          ) : (
            orders.map((o) => (
              <tr key={o._id} className="border-t border-gray-100 hover:bg-green-50/50">
                <td className="px-5 py-3 font-mono text-xs">{o._id.slice(-8)}</td>
                <td className="px-5 py-3">{o.userId?.username || "—"}</td>
                <td className="px-5 py-3 font-semibold">₹{o.totalAmount}</td>
                <td className="px-5 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${o.status === "confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}