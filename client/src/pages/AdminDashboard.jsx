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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [latestUsers, setLatestUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Protect route
  useEffect(() => {
    if (!user) {
      navigate("/signin");
    } else if (user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  const loadDashboard = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/dashboard", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to load dashboard");
      } else {
        setStats(data.stats);
        setLatestUsers(data.latestUsers);
        setRecentOrders(data.recentOrders);
      }
    } catch {
      setError("Network error while loading dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard(true);

    // auto refresh every 30 seconds
    const id = setInterval(() => {
      setRefreshing(true);
      loadDashboard(false);
    }, 30000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user || user.role !== "admin") {
    return null;
  }

  const s = stats;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-green-800">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor Gardenly users, orders, revenue and support in real time.
            </p>
          </div>
          <button
            onClick={() => {
              setRefreshing(true);
              loadDashboard(false);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500 text-green-700 hover:bg-green-50 font-medium"
          >
            <RefreshCcw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {loading && !s ? (
          <div className="py-32 text-center text-green-700 text-lg">
            Loading dashboard…
          </div>
        ) : (
          s && (
            <>
              {/* Top KPI cards */}
              <div className="grid gap-6 md:grid-cols-4 mb-10">
                <StatCard
                  icon={Users}
                  label="Total Users"
                  value={s.users.total}
                  sub={`${s.users.buyers} buyers • ${s.users.sellers} sellers • ${s.users.experts} experts`}
                />
                <StatCard
                  icon={Package}
                  label="Products"
                  value={s.products.total}
                  sub="Active catalog items"
                />
                <StatCard
                  icon={ShoppingBag}
                  label="Orders"
                  value={s.orders.total}
                  sub={`${s.orders.confirmed} completed • ${s.orders.pending} pending`}
                />
                <StatCard
                  icon={IndianRupee}
                  label="Revenue"
                  value={`₹${s.orders.revenue.toFixed(2)}`}
                  sub="Confirmed orders total"
                />
              </div>

              {/* Orders & Tickets status */}
              <div className="grid gap-6 md:grid-cols-3 mb-10">
                <MiniStat
                  icon={AlertCircle}
                  label="Pending Orders"
                  value={s.orders.pending}
                  color="bg-amber-50 border-amber-200 text-amber-700"
                />
                <MiniStat
                  icon={CheckCircle2}
                  label="Confirmed Orders"
                  value={s.orders.confirmed}
                  color="bg-emerald-50 border-emerald-200 text-emerald-700"
                />
                <MiniStat
                  icon={ClipboardList}
                  label="Open Tickets"
                  value={s.tickets.open}
                  color="bg-sky-50 border-sky-200 text-sky-700"
                  sub={`${s.tickets.resolved} resolved`}
                />
              </div>

              {/* Tables */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Latest Users */}
                <div className="bg-white rounded-2xl shadow-sm border border-green-100">
                  <div className="px-5 py-4 border-b border-green-100 flex items-center justify-between">
                    <h2 className="font-semibold text-lg text-green-800">
                      Latest Users
                    </h2>
                    <span className="text-xs text-gray-500">
                      Last {latestUsers.length} signups
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-green-50">
                        <tr className="text-left">
                          <th className="px-4 py-2">Username</th>
                          <th className="px-4 py-2">Email</th>
                          <th className="px-4 py-2">Role</th>
                          <th className="px-4 py-2">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {latestUsers.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-6 text-center text-gray-500"
                            >
                              No users found.
                            </td>
                          </tr>
                        ) : (
                          latestUsers.map((u) => (
                            <tr
                              key={u._id}
                              className="border-t border-gray-100 hover:bg-green-50/40"
                            >
                              <td className="px-4 py-2">{u.username}</td>
                              <td className="px-4 py-2">{u.email}</td>
                              <td className="px-4 py-2">{u.role}</td>
                              <td className="px-4 py-2 text-xs text-gray-500">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl shadow-sm border border-green-100">
                  <div className="px-5 py-4 border-b border-green-100 flex items-center justify-between">
                    <h2 className="font-semibold text-lg text-green-800">
                      Recent Orders
                    </h2>
                    <span className="text-xs text-gray-500">
                      Last {recentOrders.length} orders
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-green-50">
                        <tr className="text-left">
                          <th className="px-4 py-2">Order ID</th>
                          <th className="px-4 py-2">User</th>
                          <th className="px-4 py-2">Amount</th>
                          <th className="px-4 py-2">Status</th>
                          <th className="px-4 py-2">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-6 text-center text-gray-500"
                            >
                              No orders yet.
                            </td>
                          </tr>
                        ) : (
                          recentOrders.map((o) => (
                            <tr
                              key={o._id}
                              className="border-t border-gray-100 hover:bg-green-50/40"
                            >
                              <td className="px-4 py-2 text-xs">
                                {o._id.slice(-8)}
                              </td>
                              <td className="px-4 py-2">
                                {o.userId?.username || "—"}
                              </td>
                              <td className="px-4 py-2">
                                ₹{o.totalAmount.toFixed(2)}
                              </td>
                              <td className="px-4 py-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    o.status === "confirmed"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : o.status === "pending_otp"
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {o.status}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-xs text-gray-500">
                                {new Date(o.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {label}
          </p>
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
