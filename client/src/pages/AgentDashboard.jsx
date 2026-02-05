import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaPhone, FaTruck, FaCheckCircle, FaClipboardList } from "react-icons/fa";

export default function AgentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [filter, setFilter] = useState("assigned"); // assigned, picked_up, in_transit, delivered, failed

  // Redirect if not agent
  useEffect(() => {
    if (user && user.role !== "DeliveryAgent") {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch assigned orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/orders/my-deliveries", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setAssignedOrders(data.orders || []);
        } else {
          setError("Failed to fetch orders");
        }
      } catch (err) {
        setError("Error loading orders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateDeliveryStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      const res = await fetch(`/api/orders/${orderId}/update-delivery-status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryStatus: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to update status");
        return;
      }

      setAssignedOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, deliveryStatus: newStatus } : order
        )
      );
    } catch (err) {
      setError("Error updating status");
      console.error(err);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "picked_up":
        return "bg-purple-100 text-purple-800";
      case "in_transit":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    return status.replace(/_/g, " ").toUpperCase();
  };

  const filteredOrders = assignedOrders.filter(
    order => order.deliveryStatus === filter
  );

  const stats = {
    assigned: assignedOrders.filter(o => o.deliveryStatus === "assigned").length,
    picked_up: assignedOrders.filter(o => o.deliveryStatus === "picked_up").length,
    in_transit: assignedOrders.filter(o => o.deliveryStatus === "in_transit").length,
    delivered: assignedOrders.filter(o => o.deliveryStatus === "delivered").length,
    failed: assignedOrders.filter(o => o.deliveryStatus === "failed").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-poppins">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#38d39f]">🚚 My Deliveries</h1>
            <p className="text-sm text-gray-600">{user?.username}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
            <button
              onClick={() => setError("")}
              className="float-right text-red-700 hover:text-red-900"
            >
              ✕
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { key: "assigned", label: "Assigned", color: "bg-blue-50 text-blue-700" },
            { key: "picked_up", label: "Picked Up", color: "bg-purple-50 text-purple-700" },
            { key: "in_transit", label: "In Transit", color: "bg-yellow-50 text-yellow-700" },
            { key: "delivered", label: "Delivered", color: "bg-green-50 text-green-700" },
            { key: "failed", label: "Failed", color: "bg-red-50 text-red-700" },
          ].map(stat => (
            <div
              key={stat.key}
              onClick={() => setFilter(stat.key)}
              className={`p-4 rounded-lg cursor-pointer transition ${
                filter === stat.key ? `${stat.color} ring-2 ring-offset-2` : "bg-white border"
              }`}
            >
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-3xl font-bold">{stats[stat.key]}</p>
            </div>
          ))}
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaClipboardList className="text-[#38d39f]" />
            {getStatusLabel(filter)} Orders ({filteredOrders.length})
          </h2>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No orders with this status
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="border rounded-lg p-4 hover:shadow-md transition bg-gradient-to-r from-gray-50 to-white"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Order Info */}
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-mono text-sm font-bold">{order._id.slice(-12)}</p>
                      <p className="text-sm mt-2 font-semibold text-gray-700">
                        {order.billing.fullName}
                      </p>
                      <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                        <FaPhone className="text-[#38d39f]" /> {order.billing.phone}
                      </p>
                    </div>

                    {/* Address & Items */}
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <FaMapMarkerAlt className="text-[#38d39f]" /> Address
                      </p>
                      <p className="text-sm font-semibold text-gray-700">
                        {order.billing.address1}
                      </p>
                      <p className="text-xs text-gray-600">
                        {order.billing.city}, {order.billing.state} - {order.billing.pincode}
                      </p>
                      <p className="text-sm mt-2 text-gray-600">
                        <span className="font-semibold">Items:</span> {order.items.length} item(s)
                      </p>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.deliveryStatus)}`}>
                          {getStatusLabel(order.deliveryStatus)}
                        </span>
                        <p className="text-sm font-bold text-[#38d39f] mt-2">₹{order.totalAmount}</p>
                      </div>

                      {/* Status Update Buttons */}
                      <div className="flex gap-2 mt-4">
                        {order.deliveryStatus === "assigned" && (
                          <button
                            onClick={() => updateDeliveryStatus(order._id, "picked_up")}
                            disabled={updatingOrder === order._id}
                            className="flex-1 px-3 py-2 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 disabled:opacity-50 transition font-semibold"
                          >
                            {updatingOrder === order._id ? "..." : "Pick Up"}
                          </button>
                        )}
                        {order.deliveryStatus === "picked_up" && (
                          <button
                            onClick={() => updateDeliveryStatus(order._id, "in_transit")}
                            disabled={updatingOrder === order._id}
                            className="flex-1 px-3 py-2 bg-yellow-500 text-white text-xs rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition font-semibold"
                          >
                            {updatingOrder === order._id ? "..." : "Start Delivery"}
                          </button>
                        )}
                        {order.deliveryStatus === "in_transit" && (
                          <button
                            onClick={() => updateDeliveryStatus(order._id, "delivered")}
                            disabled={updatingOrder === order._id}
                            className="flex-1 px-3 py-2 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 disabled:opacity-50 transition font-semibold"
                          >
                            {updatingOrder === order._id ? "..." : "Delivered"}
                          </button>
                        )}
                        {["assigned", "picked_up", "in_transit"].includes(order.deliveryStatus) && (
                          <button
                            onClick={() => updateDeliveryStatus(order._id, "failed")}
                            disabled={updatingOrder === order._id}
                            className="px-3 py-2 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 disabled:opacity-50 transition"
                          >
                            {updatingOrder === order._id ? "..." : "✕"}
                          </button>
                        )}
                      </div>
                    </div>
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
