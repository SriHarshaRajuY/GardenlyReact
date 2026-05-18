// src/context/CartProvider.jsx
import { useState, useEffect, useCallback } from "react";
import { CartContext } from "./CartContext";
import { useAuth } from "./AuthContext";

export default function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });

  // ------- FETCH CART -------
  const fetchCart = useCallback(async () => {
    if (!user || user.role !== "buyer") {
      setCart({ items: [] });
      return;
    }

    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/cart", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      } else {
        setCart({ items: [] });
      }
    } catch (err) {
      console.error("fetchCart error:", err);
      setCart({ items: [] });
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === "buyer") {
      fetchCart();
    } else {
      setCart({ items: [] });
    }
  }, [user, fetchCart]);

  // ------- ADD TO CART -------
  const addToCart = async (productId, quantity = 1) => {
    if (!user || user.role !== "buyer") {
      alert("Please login as buyer to add to cart");
      return;
    }

    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/cart/add", {
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
      console.error("addToCart error:", err);
      alert("Error adding to cart");
    }
  };

  // ------- UPDATE QUANTITY -------
  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/cart/update", {
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
      console.error("updateQuantity error:", err);
      alert("Error updating cart");
    }
  };

  // ------- REMOVE ITEM -------
  const removeFromCart = async (productId) => {
    try {
      const res = await fetch(`${(import.meta.env.VITE_BACKEND_URL || '').trim()}/api/cart/remove/${productId}`, {
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
      console.error("removeFromCart error:", err);
      alert("Error removing from cart");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
