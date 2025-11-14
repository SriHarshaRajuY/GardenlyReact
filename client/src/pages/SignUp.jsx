// src/pages/SignUp.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaUserTag, FaEnvelope, FaPhone, FaHome } from "react-icons/fa";

const InputDiv = ({ icon, label, children, isFocused, onFocus, onBlur }) => (
  <div
    className={`relative grid grid-cols-[7%_93%] my-6 px-0 py-1 border-b-2 border-[#d9d9d9]
      before:content-[''] before:absolute before:bottom-[-2px] before:w-0 before:h-[2px] before:bg-[#38d39f] before:transition-all before:duration-400 before:right-[50%]
      after:content-[''] after:absolute after:bottom-[-2px] after:w-0 after:h-[2px] after:bg-[#38d39f] after:transition-all after:duration-400 after:left-[50%]
      ${isFocused ? "before:w-[50%] after:w-[50%]" : ""}`}
  >
    <div
      className={`text-[#d9d9d9] flex justify-center items-center transition-colors duration-300 ${
        isFocused ? "text-[#38d39f]" : ""
      }`}
    >
      {icon}
    </div>
    <div className="relative h-[45px]">
      <h5
        className={`absolute left-[10px] top-[50%] translate-y-[-50%] text-[#999] text-[18px] transition-all duration-300 pointer-events-none ${
          isFocused ? "top-[-5px] text-[15px]" : ""
        }`}
      >
        {label}
      </h5>
      {children}
    </div>
  </div>
);

export default function SignUp() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState({
    username: false,
    password: false,
    email: false,
    mobile: false,
    role: false,
  });

  const validateUsername = (v) => /^[a-zA-Z0-9_-]{3,20}$/.test(v);
  const validatePassword = (v) =>
    /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/.test(v);
  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validateMobile = (v) => /^\d{10}$/.test(v);

  const handleInput = (field, value) => {
    let msg = "";
    if (value) {
      switch (field) {
        case "username":
          if (!validateUsername(value)) msg = "Username: 3-20 chars (letters, numbers, _, - only)";
          break;
        case "password":
          if (!validatePassword(value)) msg = "Password: 8+ chars, 1 upper, 1 number, 1 symbol";
          break;
        case "email":
          if (!validateEmail(value)) msg = "Invalid email format";
          break;
        case "mobile":
          if (!validateMobile(value)) msg = "Mobile must be exactly 10 digits";
          break;
      }
    }
    setError(msg);
  };

  const handleFocus = (field) => {
    setFocused((prev) => ({ ...prev, [field]: true }));
    setError("");
  };

  const handleBlur = (field, value) => {
    if (value === "") setFocused((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let msg = "";
    if (!validateUsername(username)) msg = "Invalid username format";
    else if (!validatePassword(password)) msg = "Invalid password format";
    else if (!validateEmail(email)) msg = "Invalid email format";
    else if (!validateMobile(mobile)) msg = "Mobile number must be exactly 10 digits";
    else if (!role) msg = "Please select a role";

    if (msg) {
      setError(msg);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role, email, mobile }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }
      navigate("/signin");
    } catch {
      setError("Server error during registration");
    }
  };

  return (
    <div className="font-poppins overflow-hidden min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white relative">
      <img
        src="/images/login-register/wave.png"
        className="fixed bottom-0 left-0 h-full -z-10"
        alt="wave"
      />

      <div className="w-full h-screen grid grid-cols-1 md:grid-cols-2 gap-[7rem] px-8 relative">
        <div className="hidden md:flex justify-end items-center">
          <img src="/images/login-register/bg.png" className="w-[500px]" alt="bg" />
        </div>

        <div className="flex justify-start items-center text-center">
          <form onSubmit={handleSubmit} className="w-[360px] relative max-w-full">
            <Link
              to="/"
              className="fixed top-5 right-5 text-gray-500 text-base px-4 py-2 rounded-[20px] transition-all flex items-center hover:text-[#38d39f] hover:bg-[rgba(56,211,159,0.1)] z-10"
            >
              <FaHome className="mr-1" /> Home
            </Link>

            <img
              src="/images/login-register/avatar.png"
              className="h-[100px] mx-auto"
              alt="avatar"
            />
            <h2 className="my-[15px] text-[#333] uppercase text-[2.9rem]">Register</h2>

            {error && (
              <span className="block text-[#e74c3c] text-[0.8rem] text-left -mt-5 mb-[10px] ml-[40px] font-poppins">
                {error}
              </span>
            )}

            {/* Role */}
            <InputDiv
              icon={<FaUserTag />}
              label="Role"
              isFocused={focused.role}
              onFocus={() => handleFocus("role")}
              onBlur={() => handleBlur("role", role)}
            >
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onFocus={() => handleFocus("role")}
                onBlur={() => handleBlur("role", role)}
                className="absolute inset-0 w-full h-full border-none outline-none bg-transparent p-[0.5rem_0.7rem] text-[1.2rem] text-[#555] font-poppins appearance-none cursor-pointer pr-8"
                style={{
                  backgroundImage: `linear-gradient(45deg, transparent 50%, #999 50%), linear-gradient(135deg, #999 50%, transparent 50%)`,
                  backgroundPosition: `calc(100% - 20px) calc(1em + 2px), calc(100% - 15px) calc(1em + 2px)`,
                  backgroundSize: `5px 5px, 5px 5px`,
                  backgroundRepeat: `no-repeat`,
                }}
              >
                <option value="">Select Role</option>
                <option value="Buyer">Buyer</option>
                <option value="Seller">Seller</option>
                <option value="Admin">Admin</option>
                <option value="Expert">Expert</option>
              </select>
            </InputDiv>

            {/* Username */}
            <InputDiv
              icon={<FaUser />}
              label="Username"
              isFocused={focused.username}
              onFocus={() => handleFocus("username")}
              onBlur={() => handleBlur("username", username)}
            >
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.trim());
                  handleInput("username", e.target.value.trim());
                }}
                onFocus={() => handleFocus("username")}
                onBlur={() => handleBlur("username", username)}
                className="absolute inset-0 w-full h-full border-none outline-none bg-transparent p-[0.5rem_0.7rem] text-[1.2rem] text-[#555] font-poppins"
              />
            </InputDiv>

            {/* Email */}
            <InputDiv
              icon={<FaEnvelope />}
              label="Email"
              isFocused={focused.email}
              onFocus={() => handleFocus("email")}
              onBlur={() => handleBlur("email", email)}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value.trim());
                  handleInput("email", e.target.value.trim());
                }}
                onFocus={() => handleFocus("email")}
                onBlur={() => handleBlur("email", email)}
                className="absolute inset-0 w-full h-full border-none outline-none bg-transparent p-[0.5rem_0.7rem] text-[1.2rem] text-[#555] font-poppins"
              />
            </InputDiv>

            {/* Mobile */}
            <InputDiv
              icon={<FaPhone />}
              label="Mobile Number"
              isFocused={focused.mobile}
              onFocus={() => handleFocus("mobile")}
              onBlur={() => handleBlur("mobile", mobile)}
            >
              <input
                type="tel"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value.trim());
                  handleInput("mobile", e.target.value.trim());
                }}
                onFocus={() => handleFocus("mobile")}
                onBlur={() => handleBlur("mobile", mobile)}
                className="absolute inset-0 w-full h-full border-none outline-none bg-transparent p-[0.5rem_0.7rem] text-[1.2rem] text-[#555] font-poppins"
              />
            </InputDiv>

            {/* Password */}
            <InputDiv
              icon={<FaLock />}
              label="Password"
              isFocused={focused.password}
              onFocus={() => handleFocus("password")}
              onBlur={() => handleBlur("password", password)}
            >
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value.trim());
                  handleInput("password", e.target.value.trim());
                }}
                onFocus={() => handleFocus("password")}
                onBlur={() => handleBlur("password", password)}
                className="absolute inset-0 w-full h-full border-none outline-none bg-transparent p-[0.5rem_0.7rem] text-[1.2rem] text-[#555] font-poppins"
              />
            </InputDiv>

            <Link
              to="/signin"
              className="block text-right text-[#999] text-[0.9rem] transition-colors duration-300 hover:text-[#38d39f]"
            >
              Already have an account? Login
            </Link>

            <button
              type="submit"
              className="block w-full h-[50px] rounded-[25px] outline-none border-none bg-gradient-to-r from-[#32be8f] via-[#38d39f] to-[#32be8f] bg-[length:200%] text-[1.2rem] text-white font-poppins uppercase my-4 cursor-pointer transition-all duration-500 hover:bg-right"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}