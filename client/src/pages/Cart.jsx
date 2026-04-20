// src/pages/Cart.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FaPlus, FaMinus, FaTrashAlt, FaCreditCard } from "react-icons/fa";

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

  // 👉 Fetch cart ONLY when a buyer is logged in
  useEffect(() => {
    if (user?.role === "buyer") {
      fetchCart();
    }
  }, [user, fetchCart]);

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
      cartItems.reduce((sum, item) => {
        const price = item.product?.price ?? 0;
        return sum + price * (item.quantity ?? 0);
      }, 0),
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

  // -------- RAZORPAY ----------
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    const { fullName, phone, address1, city, state, pincode } = billing;
    if (!fullName || !phone || !address1 || !city || !state || !pincode) {
      alert("Please fill all required billing fields (*)");
      return;
    }

    const res = await loadRazorpay();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    setVerifying(true);
    try {
      const orderRes = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/orders/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: total }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID?.trim() || "rzp_test_placeholder",
        amount: orderData.order.amount,
        currency: "INR",
        name: "Gardenly",
        description: "Plant Purchase",
        order_id: orderData.order.id,
        handler: async (response) => {
          const verifyRes = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/orders/verify-razorpay-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(response),
          });
          if (verifyRes.ok) {
            alert("Payment successful! Placing your order...");
            await finalizeOrder(response.razorpay_payment_id);
          } else {
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: billing.fullName,
          contact: billing.phone,
          email: user.email,
        },
        theme: { color: "#16a34a" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed: " + err.message);
    } finally {
      setVerifying(false);
    }
  };

  const finalizeOrder = async (paymentId) => {
    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/orders/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...billing, address2: billing.address2 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const finalRes = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/orders/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId: data.orderId, otp: "PAYMENT_DONE", paymentId }),
      });
      if (finalRes.ok) {
        alert("Order placed successfully!");
        setShowBilling(false);
        setStep("form");
        await fetchCart();
      }
    } catch (err) {
      alert("Order finalization failed: " + err.message);
    }
  };

  // -------- SEND OTP ----------
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!cartItems.length) return alert("Your cart is empty");
    const { fullName, phone, address1, city, state, pincode } = billing;
    if (!fullName || !phone || !address1 || !city || !state || !pincode) return alert("Please fill all required fields");

    setSendingOtp(true);
    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/orders/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...billing }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Failed to send OTP");
      setOrderId(data.orderId);
      setStep("otp");
      alert("OTP sent to your email");
    } catch (err) {
      alert("Network error");
    } finally {
      setSendingOtp(false);
    }
  };

  // -------- VERIFY OTP ----------
  const handleVerifyOtp = async () => {
    if (!otp.trim()) return alert("Please enter OTP");
    setVerifying(true);
    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/orders/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId, otp }),
      });
      if (!res.ok) return alert("Invalid OTP");
      alert("Order placed successfully!");
      setStep("form");
      setShowBilling(false);
      await fetchCart();
    } catch (err) {
      alert("Network error");
    } finally {
      setVerifying(false);
    }
  };

  const handleQtyChange = (item, delta) => {
    const productId = item.product?._id;
    if (!productId) return alert("Product unavailable");
    const newQty = (item.quantity ?? 0) + delta;
    if (newQty < 1) return;
    updateQuantity(productId, newQty);
  };

  const handleRemove = (item) => {
    const productId = item.product?._id;
    if (!productId) return alert("Product unavailable");
    if (window.confirm("Remove item?")) removeFromCart(productId);
  };

  if (!user || user.role !== "buyer") {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="bg-white p-10 rounded-3xl shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Cart Not Available</h1>
          <p className="text-gray-600">Please sign in as a Buyer to use the cart.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf7] dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold mb-8 text-center text-green-800 dark:text-green-400">Shopping Cart</h1>
          {cartItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Your cart is empty</div>
          ) : (
            <>
              <div className="space-y-6">
                {cartItems.map((item, idx) => (
                  <div key={item.product?._id || idx} className="flex items-center justify-between border-b dark:border-gray-700 pb-6">
                    <div className="flex items-center gap-4">
                      <img src={item.product?.image || "/images/fallback.png"} className="w-20 h-20 rounded-xl object-cover" alt="" />
                      <div>
                        <h2 className="font-bold text-lg">{item.product?.name || "Product"}</h2>
                        <p className="text-green-600 font-semibold">₹{item.product?.price ?? 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 p-1 rounded-full">
                        <button onClick={() => handleQtyChange(item, -1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-gray-600 transition shadow-sm"><FaMinus size={12} /></button>
                        <span className="w-6 text-center font-bold">{item.quantity}</span>
                        <button onClick={() => handleQtyChange(item, 1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-gray-600 transition shadow-sm"><FaPlus size={12} /></button>
                      </div>
                      <div className="text-right font-bold w-24">₹{(item.product?.price * item.quantity).toFixed(2)}</div>
                      <button onClick={() => handleRemove(item)} className="text-red-400 hover:text-red-600 transition"><FaTrashAlt /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-10">
                <div className="text-2xl font-bold">Total: <span className="text-green-600">₹{total.toFixed(2)}</span></div>
                <button onClick={handleProceedToPayment} className="bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition shadow-lg">Checkout Now</button>
              </div>
            </>
          )}
        </div>

        {showBilling && (
          <div ref={billingRef} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 p-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-green-800 dark:text-green-400">Shipping & Billing</h2>
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <input name="fullName" value={billing.fullName} onChange={handleChange} placeholder="Full Name *" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-green-500" required />
                <input name="phone" value={billing.phone} onChange={handleChange} placeholder="Phone Number *" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-green-500" required />
                <div className="md:col-span-2">
                  <input name="address1" value={billing.address1} onChange={handleChange} placeholder="Address Line 1 *" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-green-500" required />
                </div>
                <input name="city" value={billing.city} onChange={handleChange} placeholder="City *" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-green-500" required />
                <input name="state" value={billing.state} onChange={handleChange} placeholder="State *" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-green-500" required />
                <input name="pincode" value={billing.pincode} onChange={handleChange} placeholder="Pincode *" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-green-500" required />
              </div>

              <div className="flex flex-wrap gap-4 justify-between items-center border-t pt-6">
                <button type="button" onClick={() => setShowBilling(false)} className="text-gray-500 font-bold hover:text-gray-700">Cancel</button>
                <div className="flex gap-4">
                  <button type="submit" disabled={sendingOtp} className="bg-amber-500 text-white px-6 py-3 rounded-full font-bold hover:bg-amber-600 transition flex items-center gap-2">
                    {sendingOtp ? "Sending..." : "Cash on Delivery (OTP)"}
                  </button>
                  <button type="button" onClick={handleRazorpayPayment} disabled={verifying} className="bg-green-600 text-white px-6 py-3 rounded-full font-bold hover:bg-green-700 transition flex items-center gap-2">
                    <FaCreditCard /> Pay with Razorpay
                  </button>
                </div>
              </div>
            </form>

            {step === "otp" && (
              <div className="mt-8 bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
                <h3 className="font-bold mb-4">Confirm Your Order</h3>
                <div className="flex gap-4">
                  <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} className="w-32 p-3 text-center text-xl tracking-widest border rounded-xl font-mono" placeholder="000000" />
                  <button onClick={handleVerifyOtp} disabled={verifying} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700">Verify & Place Order</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
