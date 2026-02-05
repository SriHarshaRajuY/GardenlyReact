// src/pages/SignIn.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaUserTag, FaHome, FaEnvelope } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const InputDiv = ({ icon, label, children, isFocused, hasValue }) => (
  <div className="relative grid grid-cols-[7%_93%] my-6 border-b-2 border-[#d9d9d9]">
    <div
      className={`flex items-center justify-center text-[#d9d9d9] transition-colors duration-300 ${
        isFocused || hasValue ? "text-[#38d39f]" : ""
      }`}
    >
      {icon}
    </div>
    <div className="relative">
      <label
        className={`absolute left-3 origin-left transition-all duration-300 pointer-events-none
        ${
          isFocused || hasValue
            ? "-top-2 text-xs text-[#38d39f] bg-white px-1"
            : "top-3 text-base text-[#999]"
        }`}
      >
        {label}
      </label>
      {children}
      <span
        className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#38d39f] scale-x-0 transition-transform duration-400 origin-center ${
          isFocused || hasValue ? "scale-x-100" : ""
        }`}
      />
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
  const [focused, setFocused] = useState({
    username: false,
    password: false,
    role: false,
  });

  const handleFocus = (field) =>
    setFocused((prev) => ({ ...prev, [field]: true }));
  const handleBlur = (field) =>
    setFocused((prev) => ({ ...prev, [field]: false }));

  // Forgot Password Modal
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !password || !role)
      return setError("Please fill all fields");

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ so cookie is set
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.message || "Invalid credentials");

      // Save token on client side too
      login(data.token);

      switch (data.user.role) {
        case "Expert":
          navigate("/expert-dashboard");
          break;
        case "Seller":
          navigate("/seller");
          break;
        case "Buyer":
          navigate("/");
          break;
        case "Admin":
          navigate("/admin-dashboard"); // ✅ fixed path
          break;
        default:
          navigate("/");
      }
    } catch {
      setError("Server error");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (step === 1) {
      if (!forgotEmail) return setForgotError("Email is required");
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotEmail }),
        });
        const data = await res.json();
        if (!res.ok) return setForgotError(data.message || "Failed to send OTP");
        setForgotSuccess("OTP sent! Check your email.");
        setStep(2);
      } catch {
        setForgotError("Network error. Try again.");
      }
    } else {
      if (!otp || !newPassword)
        return setForgotError("OTP and new password required");
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotEmail, otp, newPassword }),
        });
        const data = await res.json();
        if (!res.ok) return setForgotError(data.message || "Failed to reset");
        setForgotSuccess("Password changed! You can now login.");
        setTimeout(() => {
          setShowForgot(false);
          setStep(1);
          setForgotEmail("");
          setOtp("");
          setNewPassword("");
        }, 2000);
      } catch {
        setForgotError("Network error");
      }
    }
  };

  return (
    <div className="font-poppins min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white relative overflow-hidden">
      <img
        src="/images/login-register/wave.png"
        className="fixed bottom-0 left-0 h-full -z-10"
        alt=""
      />

      <div className="h-screen grid grid-cols-1 md:grid-cols-2 px-8">
        <div className="hidden md:flex justify-end items-center">
          <img
            src="/images/login-register/bg.png"
            className="w-[500px]"
            alt=""
          />
        </div>

        <div className="flex items-center justify-start">
          <div className="w-[360px] max-w-full">
            <Link
              to="/"
              className="fixed top-5 right-5 flex items-center gap-2 px-4 py-2 rounded-3xl hover:bg-[#38d39f11] hover:text-[#38d39f] transition z-50"
            >
              <FaHome /> Home
            </Link>

            <img
              src="/images/login-register/avatar.png"
              className="h-24 mx-auto mb-4"
              alt=""
            />
            <h2 className="text-5xl uppercase text-[#333] mb-6">Welcome</h2>
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            <form onSubmit={handleSubmit}>
              <InputDiv
                icon={<FaUserTag />}
                label="Role"
                isFocused={focused.role}
                hasValue={!!role}
              >
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
              

              <InputDiv
                icon={<FaUser />}
                label="Username"
                isFocused={focused.username}
                hasValue={!!username}
              >
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.trim())}
                  onFocus={() => handleFocus("username")}
                  onBlur={() => handleBlur("username")}
                  className="w-full pt-4 pb-2 bg-transparent outline-none text-lg text-gray-700"
                />
              </InputDiv>

              <InputDiv
                icon={<FaLock />}
                label="Password"
                isFocused={focused.password}
                hasValue={!!password}
              >
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => handleFocus("password")}
                  onBlur={() => handleBlur("password")}
                  className="w-full pt-4 pb-2 bg-transparent outline-none text-lg text-gray-700"
                />
              </InputDiv>

              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-sm text-[#38d39f] hover:underline block text-right mb-4"
              >
                Forgot Password?
              </button>

              <button className="w-full h-12 rounded-3xl bg-gradient-to-r from-[#32be8f] to-[#38d39f] text-white text-lg uppercase font-medium hover:opacity-90 transition">
                Login
              </button>
            </form>

            <Link
              to="/signup"
              className="block text-right mt-4 text-[#999] hover:text-[#38d39f] text-sm"
            >
              Don't have an account? Register
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-center">
              Reset Password
            </h3>

            {forgotError && (
              <p className="text-red-500 text-sm mb-4 text-center">
                {forgotError}
              </p>
            )}
            {forgotSuccess && (
              <p className="text-green-500 text-sm mb-4 text-center">
                {forgotSuccess}
              </p>
            )}

            <form onSubmit={handleForgotPassword}>
              {step === 1 ? (
                <InputDiv
                  icon={<FaEnvelope />}
                  label="Email"
                  isFocused={true}
                  hasValue={!!forgotEmail}
                >
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pt-4 pb-2 bg-transparent outline-none text-lg text-gray-700"
                    required
                    autoFocus
                  />
                </InputDiv>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4 text-center">
                    Enter OTP sent to <strong>{forgotEmail}</strong>
                  </p>
                  <InputDiv
                    icon={<FaLock />}
                    label="OTP"
                    isFocused={true}
                    hasValue={!!otp}
                  >
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      maxLength="6"
                      className="w-full pt-4 pb-2 bg-transparent outline-none text-lg text-center tracking-widest font-mono"
                      required
                    />
                  </InputDiv>
                  <InputDiv
                    icon={<FaLock />}
                    label="New Password"
                    isFocused={true}
                    hasValue={!!newPassword}
                  >
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pt-4 pb-2 bg-transparent outline-none text-lg text-gray-700"
                      required
                    />
                  </InputDiv>
                </>
              )}

              <button className="w-full h-12 mt-6 bg-gradient-to-r from-[#32be8f] to-[#38d39f] text-white rounded-3xl font-medium hover:opacity-90 transition">
                {step === 1 ? "Send OTP" : "Reset Password"}
              </button>
            </form>

            <button
              onClick={() => {
                setShowForgot(false);
                setStep(1);
                setForgotError("");
                setForgotSuccess("");
                setForgotEmail("");
                setOtp("");
                setNewPassword("");
              }}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 w-full text-center"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
