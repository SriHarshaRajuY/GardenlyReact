// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find(row => row.startsWith("access_token="))
      ?.split("=")[1];

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          id: decoded.id,
          username: decoded.username,
          role: decoded.role, // already lowercase
        });
      } catch (err) {
        console.log("Invalid token");
      }
    }
  }, []);

  const login = (token) => {
    const decoded = jwtDecode(token);
    setUser({
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
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