import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaPhone, FaCheckCircle, FaTimesCircle, FaClipboardList } from "react-icons/fa";

export default function ManagerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [unassignedOrders, setUnassignedOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assigningOrder, setAssigningOrder] = useState(null);

  // Redirect if not manager
  useEffect(() => {
    if (user && user.role !== "DeliveryManager") {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch unassigned orders and agents
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch unassigned orders
        const ordersRes = await fetch("/api/orders/unassigned", {
          credentials: "include",
        });
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setUnassignedOrders(data.orders || []);
        }

        // Fetch delivery agents
        const agentsRes = await fetch("/api/delivery/agents", {
          credentials: "include",
        });
        if (agentsRes.ok) {
          const data = await agentsRes.json();
          setAgents(data.agents || []);
        }
      } catch (err) {
        setError("Failed to fetch data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const assignOrder = async (orderId, agentId) => {
    if (!agentId) {
      setError("Please select an agent");
      return;
    }

    try {
      setAssigningOrder(orderId);
      const res = await fetch(`/api/orders/${orderId}/assign-agent`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to assign order");
        return;
      }

      setUnassignedOrders(prev => prev.filter(order => order._id !== orderId));
      setSelectedAgent(prev => ({ ...prev, [orderId]: "" }));
    } catch (err) {
      setError("Error assigning order");
      console.error(err);
    } finally {
      setAssigningOrder(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-poppins">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#38d39f]">🚚 Delivery Manager</h1>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unassigned Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaClipboardList className="text-[#38d39f]" />
                Unassigned Orders ({unassignedOrders.length})
              </h2>

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : unassignedOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  ✓ All orders are assigned!
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {unassignedOrders.map((order) => (
                    <div
                      key={order._id}
                      className="border-l-4 border-[#38d39f] bg-gray-50 p-4 rounded-lg hover:shadow-md transition"
                    >
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Order ID</p>
                          <p className="font-mono text-sm font-bold">{order._id.slice(-12)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="font-bold text-[#38d39f]">₹{order.totalAmount}</p>
                        </div>
                      </div>

                      {/* Customer & Items */}
                      <div className="mb-3 border-t pt-3">
                        <p className="text-sm font-semibold text-gray-700">
                          Customer: {order.billing.fullName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Items: {order.items.map(i => i.product?.name || "Product").join(", ")}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <FaPhone className="text-[#38d39f]" /> {order.billing.phone}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <FaMapMarkerAlt className="text-[#38d39f]" /> {order.billing.address1}, {order.billing.city}
                        </p>
                      </div>

                      {/* Assign Agent */}
                      <div className="flex gap-2">
                        <select
                          value={selectedAgent[order._id] || ""}
                          onChange={(e) =>
                            setSelectedAgent(prev => ({
                              ...prev,
                              [order._id]: e.target.value,
                            }))
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38d39f]"
                        >
                          <option value="">Choose agent...</option>
                          {agents.map((agent) => (
                            <option key={agent._id} value={agent._id}>
                              {agent.username} ({agent.mobile})
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => assignOrder(order._id, selectedAgent[order._id])}
                          disabled={assigningOrder === order._id || !selectedAgent[order._id]}
                          className="px-4 py-2 bg-[#38d39f] text-white rounded-lg hover:bg-[#2db88a] disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm"
                        >
                          {assigningOrder === order._id ? "Assigning..." : "Assign"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Agents List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">🚚 Delivery Agents</h2>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : agents.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No agents available yet
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {agents.map((agent) => (
                  <div key={agent._id} className="border rounded-lg p-3 bg-gradient-to-r from-[#38d39f11] to-transparent">
                    <p className="font-semibold text-gray-800">{agent.username}</p>
                    <p className="text-xs text-gray-600 truncate">{agent.email}</p>
                    <p className="text-xs text-[#38d39f] font-mono">{agent.mobile}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-[#38d39f] text-white text-xs rounded-full">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
