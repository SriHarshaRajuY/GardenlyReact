

// src/pages/SignUp.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaUserTag, FaEnvelope, FaPhone, FaHome } from "react-icons/fa";

const InputDiv = ({ icon, label, children, isFocused, hasValue }) => (
  <div className="relative grid grid-cols-[7%_93%] my-6 border-b-2 border-[#d9d9d9]">
    <div className={`flex items-center justify-center text-[#d9d9d9] transition-colors duration-300 ${isFocused || hasValue ? "text-[#38d39f]" : ""}`}>
      {icon}
    </div>
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
      <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#38d39f] scale-x-0 transition-transform duration-400 origin-center ${isFocused || hasValue ? "scale-x-100" : ""}`} />
    </div>
  </div>
);

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "", password: "", email: "", mobile: "", role: "", expertise: ""
  });
  const [error, setError] = useState("");
  const [focused, setFocused] = useState({});

  const handleFocus = (field) => setFocused(prev => ({ ...prev, [field]: true }));
  const handleBlur = (field) => setFocused(prev => ({ ...prev, [field]: false }));

  const validate = () => {
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(form.username)) return "Invalid username";
    if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/.test(form.password)) return "Weak password";
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) return "Invalid email";
    if (!/^\d{10}$/.test(form.mobile)) return "Mobile must be 10 digits";
    if (!form.role) return "Select role";
    if (form.role === "Expert" && !form.expertise) return "Select expertise";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);

    try {
      const payload = { ...form };
      if (form.role !== "Expert") delete payload.expertise;

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Registration failed");

      navigate("/signin");
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
            <h2 className="text-5xl uppercase text-[#333] mb-6">Register</h2>
            {error && <p className="text-red-500 text-sm mb-4 text-left ml-10">{error}</p>}

            <InputDiv icon={<FaUserTag />} label="Role" isFocused={focused.role} hasValue={!!form.role}>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value, expertise: "" })}
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

            {form.role === "Expert" && (
              <InputDiv icon={<FaUserTag />} label="Expertise" isFocused={focused.expertise} hasValue={!!form.expertise}>
                <select
                  value={form.expertise}
                  onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                  onFocus={() => handleFocus("expertise")}
                  onBlur={() => handleBlur("expertise")}
                  className="w-full pt-4 pb-2 bg-transparent outline-none text-lg text-gray-700"
                >
                  <option value="">Select Expertise</option>
                  <option value="General">General Gardening</option>
                  <option value="Technical">Plant Disease / Pest</option>
                  <option value="Billing">Order & Payment Issue</option>
                </select>
              </InputDiv>
            )}

            <InputDiv icon={<FaUser />} label="Username" isFocused={focused.username} hasValue={!!form.username}>
              <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.trim() })} onFocus={() => handleFocus("username")} onBlur={() => handleBlur("username")} className="w-full pt-4 pb-2 bg-transparent outline-none text-lg text-gray-700" />
            </InputDiv>

            <InputDiv icon={<FaEnvelope />} label="Email" isFocused={focused.email} hasValue={!!form.email}>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value.trim() })} onFocus={() => handleFocus("email")} onBlur={() => handleBlur("email")} className="w-full pt-4 pb-2 bg-transparent outline-none text-lg text-gray-700" />
            </InputDiv>

            <InputDiv icon={<FaPhone />} label="Mobile Number" isFocused={focused.mobile} hasValue={!!form.mobile}>
              <input type="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "").slice(0,10) })} onFocus={() => handleFocus("mobile")} onBlur={() => handleBlur("mobile")} className="w-full pt-4 pb-2 bg-transparent outline-none text-lg text-gray-700" />
            </InputDiv>

            <InputDiv icon={<FaLock />} label="Password" isFocused={focused.password} hasValue={!!form.password}>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} onFocus={() => handleFocus("password")} onBlur={() => handleBlur("password")} className="w-full pt-4 pb-2 bg-transparent outline-none text-lg text-gray-700" />
            </InputDiv>

            <Link to="/signin" className="block text-right mt-4 text-[#999] hover:text-[#38d39f] text-sm">
              Already have an account? Login
            </Link>

            <button className="w-full h-12 mt-6 rounded-3xl bg-gradient-to-r from-[#32be8f] to-[#38d39f] text-white text-lg uppercase font-medium hover:opacity-90 transition">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}