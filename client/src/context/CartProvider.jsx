// src/context/CartProvider.jsx
import { useState, useEffect } from "react";
import { CartContext } from "./CartContext";
import { useAuth } from "./AuthContext";

export default function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });

  useEffect(() => {
    if (user && user.role === "buyer") {
      fetchCart();
    } else {
      setCart({ items: [] });
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      } else {
        setCart({ items: [] });
      }
    } catch (err) {
      console.error(err);
      setCart({ items: [] });
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user || user.role !== "buyer") {
      alert("Please login as buyer to add to cart");
      return;
    }
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to add to cart");
      }
    } catch (err) {
      alert("Error adding to cart");
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await fetch("/api/cart/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to update cart");
      }
    } catch (err) {
      alert("Error updating cart");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await fetch(`/api/cart/remove/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to remove from cart");
      }
    } catch (err) {
      alert("Error removing from cart");
    }
  };

  const checkout = async () => {
    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        await res.json();
        setCart({ items: [] });
        alert("Payment successful! Thank you for your purchase.");
      } else {
        const err = await res.json();
        alert(err.message || "Checkout failed");
      }
    } catch (err) {
      alert("Error during checkout");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, checkout, fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
