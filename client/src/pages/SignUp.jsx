import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        console.error("Signup error:", data);
        alert(data.message || "Error signing up. Please try again.");
        return;
      }

      alert("✅ Account created successfully! You can now sign in.");
      navigate("/signin");
    } catch (error) {
      console.error("Network Error:", error);
      alert("Server error. Please check if backend is running.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
      <div className="w-96 bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-green-700">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            id="username"
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="border p-2 rounded-lg focus:outline-green-600"
            required
          />

          <input
            id="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 rounded-lg focus:outline-green-600"
            required
          />

          <input
            id="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="border p-2 rounded-lg focus:outline-green-600"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`bg-green-700 text-white p-2 rounded-lg hover:bg-green-800 transition ${
              loading && "opacity-60 cursor-not-allowed"
            }`}
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <a href="/signin" className="text-green-700 font-semibold">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
