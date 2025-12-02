

// src/pages/SignIn.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaUserTag, FaHome } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const InputDiv = ({ icon, label, children, isFocused, hasValue }) => (
  <div className="relative grid grid-cols-[7%_93%] my-6 border-b-2 border-[#d9d9d9]">
    {/* Icon */}
    <div className={`flex items-center justify-center text-[#d9d9d9] transition-colors duration-300 ${isFocused || hasValue ? "text-[#38d39f]" : ""}`}>
      {icon}
    </div>

    {/* Input + Floating Label */}
    <div className="relative">
      <label
        className={`absolute left-3 origin-left transition-all duration-300 pointer-events-none
          ${isFocused || hasValue 
            ? "-top-2 text-xs text-[#38d39f] bg-white px-1" 
            : "top-3 text-base text-[#999]"
          }`}
      >
        {label}
      </label>
      {children}

      {/* Animated underline */}
      <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#38d39f] scale-x-0 transition-transform duration-400 origin-center ${isFocused || hasValue ? "scale-x-100" : ""}`} />
    </div>
  </div>
);

export default function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState({ username: false, password: false, role: false });

  const handleFocus = (field) => setFocused(prev => ({ ...prev, [field]: true }));
  const handleBlur = (field) => setFocused(prev => ({ ...prev, [field]: false }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || !role) return setError("Please fill all fields");

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Invalid credentials");

      login(data.token);
      switch (data.user.role) {
        case "Expert": navigate("/expert-dashboard"); break;
        case "Seller": navigate("/seller"); break;
        case "Buyer": navigate("/"); break;
        case "Admin": navigate("/admindashboard"); break;
        default: navigate("/");
      }
    } catch {
      setError("Server error");
    }
  };

  return (
    <div className="font-poppins min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white relative overflow-hidden">
      <img src="/images/login-register/wave.png" className="fixed bottom-0 left-0 h-full -z-10" alt="" />

      <div className="h-screen grid grid-cols-1 md:grid-cols-2 px-8">
        <div className="hidden md:flex justify-end items-center">
          <img src="/images/login-register/bg.png" className="w-[500px]" alt="" />
        </div>

        <div className="flex items-center justify-start">
          <form onSubmit={handleSubmit} className="w-[360px] max-w-full">
            <Link to="/" className="fixed top-5 right-5 flex items-center gap-2 px-4 py-2 rounded-3xl hover:bg-[#38d39f11] hover:text-[#38d39f] transition">
              <FaHome /> Home
            </Link>

            <img src="/images/login-register/avatar.png" className="h-24 mx-auto mb-4" alt="" />
            <h2 className="text-5xl uppercase text-[#333] mb-6">Welcome</h2>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <InputDiv icon={<FaUserTag />} label="Role" isFocused={focused.role} hasValue={!!role}>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onFocus={() => handleFocus("role")}
                onBlur={() => handleBlur("role")}
                className="w-full pt-4 pb-2 bg-transparent outline-none text-lg text-gray-700"
              >
                <option value=""></option>
                <option value="Buyer">Buyer</option>
                <option value="Seller">Seller</option>
                <option value="Admin">Admin</option>
                <option value="Expert">Expert</option>
              </select>
            </InputDiv>

            <InputDiv icon={<FaUser />} label="Username" isFocused={focused.username} hasValue={!!username}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.trim())}
                onFocus={() => handleFocus("username")}
                onBlur={() => handleBlur("username")}
                className="w-full pt-4 pb-2 bg-transparent outline-none text-lg text-gray-700"
              />
            </InputDiv>

            <InputDiv icon={<FaLock />} label="Password" isFocused={focused.password} hasValue={!!password}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => handleFocus("password")}
                onBlur={() => handleBlur("password")}
                className="w-full pt-4 pb-2 bg-transparent outline-none text-lg text-gray-700"
              />
            </InputDiv>

            <button className="w-full h-12 mt-6 rounded-3xl bg-gradient-to-r from-[#32be8f] to-[#38d39f] text-white text-lg uppercase font-medium hover:opacity-90 transition">
              Login
            </button>

            <Link to="/signup" className="block text-right mt-4 text-[#999] hover:text-[#38d39f] text-sm">
              Don't have an account? Register
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}