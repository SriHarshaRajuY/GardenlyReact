import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const STATUS_COLORS = {
  confirmed: "bg-emerald-100 text-emerald-700",
  pending_otp: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/admin/orders", { credentials: "include" });
        const data = await res.json();
        if (!res.ok) return setError(data.message || "Failed to load orders");
        setOrders(data.orders);
        setFiltered(data.orders);
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    let list = [...orders];
    if (statusFilter !== "All") list = list.filter(o => o.status === statusFilter);
    if (search.trim()) list = list.filter(o =>
      o._id.includes(search) || o.userId?.username?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(list);
  }, [search, statusFilter, orders]);

  const totalRevenue = orders.filter(o => o.status === "confirmed").reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">{filtered.length} orders • Total Revenue: <strong className="text-green-700">₹{totalRevenue.toFixed(0)}</strong></p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
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
          <option value="confirmed">Confirmed</option>
          <option value="pending_otp">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

      {loading ? (
        <div className="py-24 text-center text-gray-400">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading orders...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Order ID</th>
                  <th className="px-5 py-3 text-left">Customer</th>
                  <th className="px-5 py-3 text-left">Items</th>
                  <th className="px-5 py-3 text-left">Amount</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">No orders found</td></tr>
                ) : filtered.map((o) => (
                  <>
                    <tr key={o._id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">{o._id.slice(-8).toUpperCase()}</td>
                      <td className="px-5 py-3 font-medium">{o.userId?.username || "—"}</td>
                      <td className="px-5 py-3 text-gray-500">{o.items?.length || 0} item(s)</td>
                      <td className="px-5 py-3 font-bold text-green-700">₹{o.totalAmount}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-600"}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => setExpanded(expanded === o._id ? null : o._id)}
                          className="text-xs text-green-600 hover:underline font-medium"
                        >
                          {expanded === o._id ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                    {expanded === o._id && (
                      <tr key={`${o._id}-expanded`} className="bg-blue-50">
                        <td colSpan={7} className="px-5 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-2">📦 Order Items</p>
                              {o.items?.map((item, i) => (
                                <div key={i} className="text-xs text-gray-600 flex justify-between py-1 border-b border-blue-100">
                                  <span>{item.product?.name || "Product deleted"} × {item.quantity}</span>
                                  <span className="font-semibold">₹{item.price * item.quantity}</span>
                                </div>
                              ))}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-2">🚚 Shipping Address</p>
                              <p className="text-xs text-gray-600">{o.billing?.fullName}</p>
                              <p className="text-xs text-gray-500">{o.billing?.address1}, {o.billing?.city}, {o.billing?.state} - {o.billing?.pincode}</p>
                              <p className="text-xs text-gray-500">📞 {o.billing?.phone}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}