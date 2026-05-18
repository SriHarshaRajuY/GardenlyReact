// src/context/AuthProvider.jsx
import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { jwtDecode } from "jwt-decode";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, verify session by calling the server (since cookie is httpOnly)
  useEffect(() => {
    const restoreSession = async () => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 2500);

      try {
        const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/user/me", {
          credentials: "include", // sends the httpOnly cookie
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          const u = data.user; // API returns { success, user: {...} }
          setUser({
            id: u._id,
            username: u.username,
            role: u.role?.toLowerCase() ?? "buyer",
            email: u.email || "",
            mobile: u.mobile || "",
          });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        window.clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (token, userData) => {
    if (userData) {
      setUser({
        id: userData._id || userData.id,
        username: userData.username,
        role: userData.role?.toLowerCase() ?? "buyer",
        email: userData.email || "",
        mobile: userData.mobile || "",
      });
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser({
        id: decoded.id,
        username: decoded.username,
        role: decoded.role?.toLowerCase() ?? "buyer",
        email: "",
        mobile: "",
      });
    } catch (err) {
      console.error("Invalid token on login", err);
    }
  };

  const logout = async () => {
    try {
      await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (err) {
      console.error("Logout failed", err);
    }

    setUser(null);
  };

  // Don't render children until we've checked session (prevents flash redirect)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf7]">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
