import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/*
  ROLE BASED PROFILE PAGE
  Buyer  -> Order history dashboard
  Seller -> Seller business dashboard
*/

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // buyer states
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);

  // seller states
  const [sellerOrders, setSellerOrders] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);

  // protect route
  useEffect(() => {
    if (!user) navigate("/signin");
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    // ================= SELLER DASHBOARD =================
    if (user.role === "seller") {
      const loadSeller = async () => {
        try {
          const [orderRes, sumRes] = await Promise.all([
            fetch("/api/seller/orders", { credentials: "include" }),
            fetch("/api/seller/summary", { credentials: "include" }),
          ]);

          const orderData = await orderRes.json();
          const sumData = await sumRes.json();

          setSellerOrders(orderData.sales || []);
          setSummary(sumData.stats || {});
        } catch {
          console.log("seller dashboard error");
        } finally {
          setLoading(false);
        }
      };

      loadSeller();
      return;
    }

    // ================= BUYER DASHBOARD =================
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/me", {
          credentials: "include",
        });
        const data = await res.json();

        setProfile(data.user);
        setStats(data.stats);
        setOrders(data.orders || []);
      } catch {
        console.log("buyer dashboard error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (!user) return null;

  /* =====================================================
        SELLER DASHBOARD UI
     ===================================================== */

  if (user.role === "seller") {
    return (
      <div className="min-h-screen bg-green-50 pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4">

          <h1 className="text-3xl font-bold text-green-800 mb-8">
            Seller Dashboard
          </h1>

          {loading ? (
            <p>Loading dashboard...</p>
          ) : (
            <>
              {/* SUMMARY CARDS */}
              {summary && (
                <div className="grid md:grid-cols-4 gap-6 mb-10">
                  <Card title="Total Products" value={summary.totalProducts} />
                  <Card title="Units Sold" value={summary.totalUnitsSold} />
                  <Card title="Out Of Stock" value={summary.outOfStock} />
                  <Card
                    title="Total Earnings"
                    value={`₹${summary.totalEarnings}`}
                    highlight
                  />
                </div>
              )}

              {/* ORDERS TABLE */}
              <div className="bg-white rounded-xl shadow overflow-x-auto">
                <div className="p-4 border-b font-semibold text-green-800">
                  Customer Orders
                </div>

                {sellerOrders.length === 0 ? (
                  <div className="p-6 text-gray-500 text-center">
                    No sales yet
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-green-100">
                      <tr>
                        <th className="p-3 text-left">Product</th>
                        <th className="p-3 text-left">Buyer</th>
                        <th className="p-3 text-left">Phone</th>
                        <th className="p-3 text-left">Qty</th>
                        <th className="p-3 text-left">Total</th>
                        <th className="p-3 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellerOrders.map((o) => (
                        <tr key={o.orderId} className="border-b">
                          <td className="p-3">{o.productName}</td>
                          <td className="p-3">{o.buyer.name}</td>
                          <td className="p-3">{o.buyer.phone}</td>
                          <td className="p-3">{o.quantity}</td>
                          <td className="p-3 text-green-700 font-semibold">
                            ₹{o.total}
                          </td>
                          <td className="p-3">
                            {new Date(o.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  /* =====================================================
        BUYER DASHBOARD UI
     ===================================================== */

  if (loading) return <div className="pt-24 text-center">Loading…</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4">

        <h1 className="text-3xl font-bold text-green-800 mb-8">
          My Orders
        </h1>

        {/* Profile Info */}
        {profile && (
          <div className="bg-white rounded-xl shadow p-5 mb-8">
            <p><strong>Name:</strong> {profile.username}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Mobile:</strong> {profile.mobile}</p>
            <p><strong>Joined:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card title="Total Orders" value={stats?.totalOrders || 0} />
          <Card title="Completed" value={stats?.confirmedOrders || 0} />
          <Card title="Pending OTP" value={stats?.pendingOrders || 0} />
          <Card title="Cancelled" value={stats?.cancelledOrders || 0} />
        </div>

        {/* Order History */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-4 border-b font-semibold text-green-800">
            Order History
          </div>

          {orders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              You haven't placed any orders yet.
            </div>
          ) : (
            <div className="divide-y">
              {orders.map((order) => (
                <div key={order._id} className="p-4 flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order #{order._id.slice(-8)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.items.map((i) => i.product?.name).join(", ")}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-green-700">
                      ₹{order.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-xs capitalize">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* CARD COMPONENT */

function Card({ title, value, highlight }) {
  return (
    <div className={`p-5 rounded-xl shadow ${highlight ? "bg-green-600 text-white" : "bg-white"}`}>
      <p className="text-sm opacity-70">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  );
}