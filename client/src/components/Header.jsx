// src/components/Header.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaLeaf, FaBars, FaTimes, FaSearch, FaShoppingCart } from "react-icons/fa";
import { RiMoonLine, RiSunLine } from "react-icons/ri";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("selected-theme") === "dark"
  );
  const [searchTerm, setSearchTerm] = useState("");   // ✅ NEW

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("selected-theme", !darkMode ? "dark" : "light");
    document.body.classList.toggle("dark", !darkMode);
  };

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const cartCount = cart?.items?.length || 0;

  const handleSearch = () => {
    const q = searchTerm.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSearchKey = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const NavLinks = ({ isMobile = false }) => (
    <>
      <Link to="/" onClick={() => isMobile && setMenuOpen(false)} className="hover:text-green-600">
        Home
      </Link>

      {user?.role === "seller" && (
        <Link
          to="/seller"
          onClick={() => isMobile && setMenuOpen(false)}
          className="hover:text-green-600"
        >
          Sell Us
        </Link>
      )}

      {user?.role === "buyer" && (
        <Link
          to="/expert-support"
          onClick={() => isMobile && setMenuOpen(false)}
          className="hover:text-green-600"
        >
          Expert Support
        </Link>
      )}

      {user?.role === "expert" && (
        <Link
          to="/expert-dashboard"
          onClick={() => isMobile && setMenuOpen(false)}
          className="hover:text-green-600"
        >
          Expert Dashboard
        </Link>
      )}

      {user?.role === "admin" && (
        <Link
          to="/admin-dashboard"
          onClick={() => isMobile && setMenuOpen(false)}
          className="hover:text-green-600"
        >
          Admin
        </Link>
      )}

      <Link
        to="/blog"
        onClick={() => isMobile && setMenuOpen(false)}
        className="hover:text-green-600"
      >
        Blogs
      </Link>

      <Link
        to="/cart"
        onClick={() => isMobile && setMenuOpen(false)}
        className="flex items-center gap-1 hover:text-green-600"
      >
        <FaShoppingCart /> Cart {cartCount > 0 && `(${cartCount})`}
      </Link>

      {user ? (
        <>
          <Link
            to="/profile"
            onClick={() => isMobile && setMenuOpen(false)}
            className="hover:text-green-600"
          >
            {user.username}
          </Link>
          <button
            onClick={() => {
              handleLogout();
              if (isMobile) setMenuOpen(false);
            }}
            className="hover:text-green-600"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            to="/signin"
            onClick={() => isMobile && setMenuOpen(false)}
            className="hover:text-green-600"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            onClick={() => isMobile && setMenuOpen(false)}
            className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition"
          >
            Sign Up
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="bg-[#f7f9f7] dark:bg-[#121512] text-gray-800 dark:text-white shadow-md fixed w-full z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 py-3">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center text-green-700 dark:text-green-400 text-2xl font-bold"
        >
          <FaLeaf className="mr-2" />
          Gardenly
        </Link>

        {/* 🔍 Search */}
        <div className="hidden md:flex items-center bg-white dark:bg-[#1a1c19] border rounded-lg px-3 py-1">
          <input
            type="text"
            placeholder="Search products..."
            className="bg-transparent outline-none text-sm w-40 md:w-64 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKey}
          />
          <button onClick={handleSearch}>
            <FaSearch className="text-green-600 dark:text-green-400 ml-2 cursor-pointer" />
          </button>
        </div>

        {/* Dark-mode + mobile toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="text-xl text-green-700 dark:text-yellow-400"
          >
            {darkMode ? <RiSunLine /> : <RiMoonLine />}
          </button>
          <button
            className="text-2xl text-green-700 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 font-medium">
          <NavLinks />
        </nav>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden bg-[#f7f9f7] dark:bg-[#1a1c19] text-center py-3 flex flex-col gap-3 shadow-inner">
          {/* Simple search bar on mobile */}
          <div className="px-4 mb-2 flex items-center bg-white dark:bg-[#1a1c19] border rounded-lg">
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 bg-transparent outline-none text-sm dark:text-white py-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                  setMenuOpen(false);
                }
              }}
            />
            <button
              onClick={() => {
                handleSearch();
                setMenuOpen(false);
              }}
            >
              <FaSearch className="text-green-600 dark:text-green-400 ml-2" />
            </button>
          </div>

          <NavLinks isMobile />
        </nav>
      )}
    </header>
  );
}
