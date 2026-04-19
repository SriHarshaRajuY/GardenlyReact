// src/pages/SignUp.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaUserTag, FaEnvelope, FaPhone, FaHome, FaCheckCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

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
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "", password: "", email: "", mobile: "", role: "", expertise: ""
  });
  const [error, setError] = useState("");
  const [focused, setFocused] = useState({});
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFocus = (field) => setFocused(prev => ({ ...prev, [field]: true }));
  const handleBlur = (field) => setFocused(prev => ({ ...prev, [field]: false }));

  const googleBtnRef = useRef(null);
  const roleRef = useRef("");

  useEffect(() => {
    roleRef.current = form.role;
  }, [form.role]);

  const handlePostLoginNavigation = (loggedInUserRole) => {
    const role = (loggedInUserRole || "").toLowerCase();
    switch (role) {
      case "expert":
        navigate("/expert-dashboard");
        break;
      case "seller":
        navigate("/seller");
        break;
      case "buyer":
        navigate("/");
        break;
      case "admin":
        navigate("/admin/dashboard");
        break;
      default:
        navigate("/");
    }
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
    if (!clientId || !googleBtnRef.current) return;
    let cancelled = false;

    const initializeGoogle = () => {
      if (cancelled || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            setError("");
            const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/auth/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                credential: response.credential,
                role: roleRef.current || "Buyer",
              }),
            });
            const data = await res.json();
            if (!res.ok) {
              setError(data.message || "Google sign up failed");
              return;
            }
            if (data.require2FA) {
              // Google login typically bypasses 2FA in this specific backend flow,
              // but we check just in case. Since we don't have a 2FA UI state in SignUp, 
              // we can just redirect to signin to handle it, or show error.
              setError("Please sign in to complete 2FA verification.");
              navigate("/signin");
            } else {
              login(data.token);
              handlePostLoginNavigation(data.user.role);
            }
          } catch {
            setError("Google sign up failed");
          }
        },
      });

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        text: "signup_with",
        shape: "pill",
        width: 320,
      });
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return () => { cancelled = true; };
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);

    return () => { cancelled = true; };
  }, [login, navigate]);

  const validate = () => {
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(form.username)) return "Invalid username (3-20 chars, letters, numbers, _, -)";
    if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/.test(form.password)) return "Password must be 8+ chars with uppercase, number, special char";
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

    setLoading(true);
    setError("");

    try {
      const payload = { ...form };
      if (form.role !== "Expert") delete payload.expertise;

      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      if (data.requireVerification) {
        setShowOtpScreen(true);
      } else {
        navigate("/signin");
      }
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return setError("Enter OTP");
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch((import.meta.env.VITE_BACKEND_URL || '').trim() + "/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        alert("Email verified! You can now login.");
        navigate("/signin");
      } else {
        setError(data.message || "Verification failed");
      }
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
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
          {!showOtpScreen ? (
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
                    <option value=""></option>
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

              <button disabled={loading} className="w-full h-12 mt-6 rounded-3xl bg-gradient-to-r from-[#32be8f] to-[#38d39f] text-white text-lg uppercase font-medium hover:opacity-90 transition disabled:opacity-50">
                {loading ? "Registering..." : "Register"}
              </button>

              <div className="my-4 text-center text-sm text-gray-500">or</div>
              <div className="flex justify-center">
                <div ref={googleBtnRef} />
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="w-[360px] max-w-full">
              <div className="text-center mb-8">
                <FaCheckCircle className="text-6xl text-[#38d39f] mx-auto mb-4" />
                <h2 className="text-3xl uppercase text-[#333] mb-2">Verify Email</h2>
                <p className="text-gray-500">We've sent a 6-digit code to {form.email}</p>
              </div>

              {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

              <InputDiv icon={<FaEnvelope />} label="OTP Code" isFocused={focused.otp} hasValue={!!otp}>
                <input type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} onFocus={() => handleFocus("otp")} onBlur={() => handleBlur("otp")} className="w-full pt-4 pb-2 bg-transparent outline-none text-xl tracking-widest text-center text-gray-700" />
              </InputDiv>

              <button disabled={loading} className="w-full h-12 mt-6 rounded-3xl bg-gradient-to-r from-[#32be8f] to-[#38d39f] text-white text-lg uppercase font-medium hover:opacity-90 transition disabled:opacity-50">
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}