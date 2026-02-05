// client/src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  BadgeCheck,
  Calendar,
  ShoppingBag,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Protect route
  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/user/me", {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.message || "Failed to load profile");
        } else {
          setProfile(data.user);
          setStats(data.stats);
          setOrders(data.orders || []);
        }
      } catch (err) {
        setError("Network error while loading profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (!user) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-3 h-3" />
            Confirmed
          </span>
        );
      case "pending_otp":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
            <AlertCircle className="w-3 h-3" />
            Pending OTP
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-green-800">
            My Profile
          </h1>
          <p className="text-gray-600 mt-2">
            View your account details and past orders.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {loading && !profile ? (
          <div className="py-32 text-center text-green-700 text-lg">
            Loading profile…
          </div>
        ) : (
          profile && (
            <div className="space-y-8">
              {/* Top section: profile card + stats */}
              <div className="grid gap-6 md:grid-cols-3">
                {/* Profile card */}
                <div className="md:col-span-1 bg-white rounded-2xl shadow-sm border border-green-100 p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-gray-900">
                        {profile.username}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" /> {profile.role}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700 pt-1">
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-green-600" />
                      <span>{profile.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-600" />
                      <span>{profile.mobile}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span>
                        Joined{" "}
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </span>
                    </p>
                    {profile.expertise && profile.role === "Expert" && (
                      <p className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                          Expertise: {profile.expertise}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats cards */}
                <div className="md:col-span-2 grid gap-4 md:grid-cols-3">
                  <StatCard
                    icon={ShoppingBag}
                    label="Total Orders"
                    value={stats?.totalOrders || 0}
                    color="bg-green-50 text-green-800 border-green-100"
                  />
                  <StatCard
                    icon={CheckCircle2}
                    label="Completed"
                    value={stats?.confirmedOrders || 0}
                    color="bg-emerald-50 text-emerald-800 border-emerald-100"
                  />
                  <StatCard
                    icon={IndianRupee}
                    label="Total Spent"
                    value={`₹${(stats?.totalSpent || 0).toFixed(2)}`}
                    color="bg-yellow-50 text-yellow-800 border-yellow-100"
                  />
                  <StatCard
                    icon={AlertCircle}
                    label="Pending OTP"
                    value={stats?.pendingOrders || 0}
                    color="bg-amber-50 text-amber-800 border-amber-100"
                  />
                  <StatCard
                    icon={XCircle}
                    label="Cancelled"
                    value={stats?.cancelledOrders || 0}
                    color="bg-red-50 text-red-800 border-red-100"
                  />
                </div>
              </div>

              {/* Orders list */}
              <div className="bg-white rounded-2xl shadow-sm border border-green-100">
                <div className="px-5 py-4 border-b border-green-100 flex items-center justify-between">
                  <h2 className="font-semibold text-lg text-green-800">
                    Order History
                  </h2>
                  <span className="text-xs text-gray-500">
                    {orders.length === 0
                      ? "No orders yet"
                      : `Showing ${orders.length} order${
                          orders.length > 1 ? "s" : ""
                        }`}
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 text-sm">
                    You haven&apos;t placed any orders yet.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-green-50/40 transition"
                      >
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">
                            Order ID:{" "}
                            <span className="font-mono">
                              {order._id.slice(-8)}
                            </span>
                          </p>
                          <p className="text-sm text-gray-700">
                            Placed on{" "}
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.items.length} item
                            {order.items.length > 1 ? "s" : ""}:{" "}
                            {order.items
                              .map((i) => i.product?.name || "Item")
                              .join(", ")}
                          </p>
                        </div>

                        <div className="flex flex-col md:items-end gap-1">
                          <p className="font-semibold text-green-800 flex items-center gap-1 text-sm">
                            <IndianRupee className="w-4 h-4" />
                            {order.totalAmount.toFixed(2)}
                          </p>
                          <div>{getStatusBadge(order.status)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div
      className={`rounded-2xl border p-4 flex items-center gap-3 text-sm ${color}`}
    >
      <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
