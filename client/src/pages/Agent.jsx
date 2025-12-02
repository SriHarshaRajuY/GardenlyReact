import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Agent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/agent", { credentials: "include" });
      if (res.ok) {
        const j = await res.json();
        setOrders(j.orders || []);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error(e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    if (!confirm(`Set status to ${status}?`)) return;
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Status updated");
        fetchOrders();
      } else {
        alert(data.message || "Update failed");
      }
    } catch (e) {
      console.error(e);
      alert("Network error");
    } finally {
      setUpdating(null);
    }
  };

  if (!user || user.role !== "agent") {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-4xl mx-auto p-6">
          <h2 className="text-2xl font-bold">Delivery Agent area</h2>
          <p className="mt-4">You must be logged in as an Agent to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Agent — Assigned Orders</h1>

        {loading ? (
          <p>Loading…</p>
        ) : orders.length === 0 ? (
          <p>No assigned orders.</p>
        ) : (
          orders.map((o) => (
            <div key={o._id} className="bg-white p-4 rounded mb-4 shadow">
              <div className="flex justify-between">
                <div>
                  <strong>Order #{o._id}</strong>
                  <div className="text-sm text-gray-600">Total: ₹{o.totalAmount}</div>
                </div>
                <div className="text-sm">Status: <span className="font-semibold">{o.status}</span></div>
              </div>

              <div className="mt-3 text-sm">
                {o.items?.map((it) => (
                  <div key={it.product?._id} className="flex justify-between">
                    <span>{it.product?.name || 'Product'}</span>
                    <span>x{it.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                {o.status === "assigned" && (
                  <button disabled={updating === o._id} onClick={() => updateStatus(o._id, "picked_up")} className="bg-yellow-500 text-white px-3 py-1 rounded disabled:opacity-50">Mark Picked Up</button>
                )}
                {o.status === "picked_up" && (
                  <button disabled={updating === o._id} onClick={() => updateStatus(o._id, "delivered")} className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50">Mark Delivered</button>
                )}
                {(o.status === "assigned" || o.status === "picked_up") && (
                  <button disabled={updating === o._id} onClick={() => updateStatus(o._id, "cancelled")} className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50">Cancel</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
