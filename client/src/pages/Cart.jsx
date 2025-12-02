// src/pages/Cart.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FaPlus, FaMinus, FaTrashAlt } from "react-icons/fa";

export default function Cart() {
  const { cart, fetchCart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();

  const [showBilling, setShowBilling] = useState(false);
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [otp, setOtp] = useState("");
  const billingRef = useRef(null);

  const [billing, setBilling] = useState({
    fullName: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  // Prefill billing from logged in user
  useEffect(() => {
    if (user) {
      setBilling((prev) => ({
        ...prev,
        fullName: prev.fullName || user.username || "",
        phone: prev.phone || user.mobile || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBilling((prev) => ({ ...prev, [name]: value }));
  };

  const cartItems = cart?.items || [];

  const total = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
      ),
    [cartItems]
  );

  const handleProceedToPayment = () => {
    if (!cartItems.length) {
      alert("Your cart is empty");
      return;
    }
    setShowBilling(true);
    setStep("form");
    setOrderId(null);
    setOtp("");

    setTimeout(() => {
      billingRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // -------- SEND OTP ----------
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!cartItems.length) {
      alert("Your cart is empty");
      return;
    }

    const { fullName, phone, address1, city, state, pincode } = billing;
    if (!fullName || !phone || !address1 || !city || !state || !pincode) {
      alert("Please fill all required billing fields (*)");
      return;
    }

    setSendingOtp(true);
    try {
      const res = await fetch("/api/orders/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName,
          phone,
          address1,
          address2: billing.address2,
          city,
          state,
          pincode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to send OTP");
        return;
      }

      setOrderId(data.orderId);
      setStep("otp");
      alert("OTP sent to your registered email");
    } catch (err) {
      console.error("send-otp error:", err);
      alert("Network error, please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  // -------- VERIFY OTP ----------
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      alert("Please enter OTP");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch("/api/orders/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to verify OTP");
        return;
      }

      alert("Order placed successfully!");
      setStep("form");
      setShowBilling(false);
      setOrderId(null);
      setOtp("");
      await fetchCart(); // cart will be empty now
    } catch (err) {
      console.error("verify-otp error:", err);
      alert("Network error, please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleQtyChange = (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    updateQuantity(item.product._id, newQty);
  };

  const handleRemove = (item) => {
    if (window.confirm("Remove this item from cart?")) {
      removeFromCart(item.product._id);
    }
  };

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {/* CART CARD */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Your Cart</h1>

          {cartItems.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              Your cart is empty.
            </p>
          ) : (
            <>
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          item.product.image || "/images/fallback-plant.jpg"
                        }
                        alt={item.product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h2 className="font-semibold text-lg">
                          {item.product.name}
                        </h2>
                        <p className="text-sm text-gray-500">
                          ₹{item.product.price} each
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <button
                          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                          onClick={() => handleQtyChange(item, -1)}
                        >
                          <FaMinus />
                        </button>
                        <span className="w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                          onClick={() => handleQtyChange(item, 1)}
                        >
                          <FaPlus />
                        </button>
                      </div>

                      <div className="w-20 text-right font-semibold">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </div>

                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleRemove(item)}
                        title="Remove"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="text-lg font-semibold">
                  Total:{" "}
                  <span className="text-green-700">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleProceedToPayment}
                  className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700"
                >
                  Proceed to Payment
                </button>
              </div>
            </>
          )}
        </div>

        {/* BILLING + OTP */}
        {showBilling && (
          <div ref={billingRef} className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Billing Details</h2>

            {/* Billing form */}
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name *
                  </label>
                  <input
                    name="fullName"
                    value={billing.fullName}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone *
                  </label>
                  <input
                    name="phone"
                    value={billing.phone}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Address Line 1 *
                </label>
                <input
                  name="address1"
                  value={billing.address1}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Address Line 2
                </label>
                <input
                  name="address2"
                  value={billing.address2}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    City *
                  </label>
                  <input
                    name="city"
                    value={billing.city}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    State *
                  </label>
                  <input
                    name="state"
                    value={billing.state}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Pincode *
                  </label>
                  <input
                    name="pincode"
                    value={billing.pincode}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-1">
                OTP will be sent to your registered email:{" "}
                <span className="font-medium">{user?.email}</span>
              </p>

              {/* FORM BUTTONS */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBilling(false);
                    setStep("form");
                    setOrderId(null);
                    setOtp("");
                  }}
                  className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                {step === "form" && (
                  <button
                    type="submit"
                    disabled={sendingOtp}
                    className="px-6 py-2 rounded-full bg-green-600 text-white font-semibold disabled:opacity-70"
                  >
                    {sendingOtp ? "Sending OTP..." : "Send OTP"}
                  </button>
                )}
              </div>
            </form>

            {/* OTP SECTION */}
            {step === "otp" && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">
                  Enter OTP to confirm order
                </h3>
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="border rounded-lg px-4 py-2 text-center tracking-widest text-lg w-40"
                    placeholder="123456"
                  />
                  <button
                    onClick={handleVerifyOtp}
                    disabled={verifying}
                    className="px-6 py-2 rounded-full bg-green-600 text-white font-semibold disabled:opacity-70"
                  >
                    {verifying ? "Verifying..." : "Confirm Order"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
