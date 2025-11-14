// src/context/AuthContext.jsx (Fixed: Ensure role is lowercase)
import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = document.cookie.split("; ").find((row) => row.startsWith("access_token="))?.split("=")[1];
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          id: decoded.id,
          username: decoded.username,
          role: decoded.role?.toLowerCase() ?? "buyer",
        });
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, []);

  const login = (token) => {
    document.cookie = `access_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    const decoded = jwtDecode(token);
    setUser({
      id: decoded.id,
      username: decoded.username,
      role: decoded.role?.toLowerCase() ?? "buyer",
    });
  };

  const logout = () => {
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};