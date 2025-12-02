import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Manager() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [oRes, aRes] = await Promise.all([
        fetch("/api/orders/manager/orders", { credentials: "include" }),
        fetch("/api/user/agents", { credentials: "include" }),
      ]);

      if (oRes.ok) {
        const j = await oRes.json();
        setOrders(j.orders || []);
      } else {
        setOrders([]);
      }

      if (aRes.ok) {
        const j = await aRes.json();
        setAgents(j.agents || []);
      } else {
        setAgents([]);
      }
    } catch (e) {
      console.error(e);
      setOrders([]);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (orderId, agentId) => {
    if (!confirm("Assign this agent to the order?")) return;
    setAssigning(orderId);
    try {
      const res = await fetch("/api/orders/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId, agentId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Agent assigned");
        fetchData();
      } else {
        alert(data.message || "Assign failed");
      }
    } catch (e) {
      console.error(e);
      alert("Network error");
    } finally {
      setAssigning(null);
    }
  };

  if (!user || user.role !== "manager") {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-4xl mx-auto p-6">
          <h2 className="text-2xl font-bold">Manager area</h2>
          <p className="mt-4">You must be logged in as a Manager to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Manager — Assign Delivery Agents</h1>

        {loading ? (
          <p>Loading…</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <section className="bg-white p-4 rounded shadow">
              <h2 className="font-semibold mb-3">Unassigned Orders</h2>
              {orders.length === 0 ? (
                <p className="text-sm text-gray-500">No unassigned confirmed orders.</p>
              ) : (
                orders.map((o) => (
                  <div key={o._id} className="border p-3 rounded mb-3">
                    <div className="flex justify-between mb-2">
                      <strong>Order #{o._id}</strong>
                      <span className="text-sm text-gray-600">Total: ₹{o.totalAmount}</span>
                    </div>
                    <div className="text-sm text-gray-700 mb-2">Customer: {o.userId?.username || o.userId?._id}</div>
                    <div className="text-sm mb-2">
                      {o.items?.map((it) => (
                        <div key={it.product?._id} className="flex justify-between">
                          <span>{it.product?.name || 'Product'}</span>
                          <span>x{it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <select id={`agent-${o._id}`} className="p-2 border rounded bg-white">
                        <option value="">Choose agent</option>
                        {agents.map((a) => (
                          <option key={a._id} value={a._id}>
                            {a.username} {a.isAvailable ? "(available)" : ""}
                          </option>
                        ))}
                      </select>
                      <button
                        disabled={assigning === o._id}
                        onClick={() => {
                          const sel = document.getElementById(`agent-${o._id}`);
                          const agentId = sel?.value;
                          if (!agentId) return alert("Select an agent first");
                          handleAssign(o._id, agentId);
                        }}
                        className="ml-auto bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
                      >
                        {assigning === o._id ? "Assigning…" : "Assign"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </section>

            <section className="bg-white p-4 rounded shadow">
              <h2 className="font-semibold mb-3">Agents</h2>
              {agents.length === 0 ? (
                <p className="text-sm text-gray-500">No agents found.</p>
              ) : (
                agents.map((a) => (
                  <div key={a._id} className="border p-3 rounded mb-3 flex justify-between items-center">
                    <div>
                      <strong>{a.username}</strong>
                      <div className="text-sm text-gray-600">{a.email}</div>
                    </div>
                    <div className="text-sm">{a.isAvailable ? <span className="text-green-600">Available</span> : <span className="text-gray-500">Unavailable</span>}</div>
                  </div>
                ))
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
