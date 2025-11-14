import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaLeaf, FaBars, FaTimes, FaSearch, FaShoppingCart } from "react-icons/fa";
import { RiMoonLine, RiSunLine } from "react-icons/ri";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("selected-theme") === "dark"
  );

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("selected-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

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

        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-white dark:bg-[#1a1c19] border rounded-lg px-3 py-1">
          <input
            type="text"
            placeholder="Search products..."
            className="bg-transparent outline-none text-sm w-40 md:w-64 dark:text-white"
          />
          <FaSearch className="text-green-600 dark:text-green-400 ml-2" />
        </div>

        {/* Dark Mode + Mobile Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
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

        {/* Desktop Navbar */}
        <nav className="hidden md:flex items-center gap-6 font-medium">
          <Link to="/" className="hover:text-green-600">Home</Link>
          <Link to="/seller" className="hover:text-green-600">Sell Us</Link>
          <Link to="/expert_support" className="hover:text-green-600">Expert Support</Link>
          <Link to="/blog" className="hover:text-green-600">Blogs</Link>
          <Link to="/cart" className="flex items-center gap-1 hover:text-green-600">
            <FaShoppingCart /> Cart
          </Link>
          <Link to="/signin" className="hover:text-green-600">Sign In</Link>
          <Link
            to="/signup"
            className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition"
          >
            Sign Up
          </Link>
        </nav>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden bg-[#f7f9f7] dark:bg-[#1a1c19] text-center py-3 flex flex-col gap-3 shadow-inner">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/seller" onClick={() => setMenuOpen(false)}>Sell Us</Link>
          <Link to="/expert_support" onClick={() => setMenuOpen(false)}>Expert Support</Link>
          <Link to="/blog" onClick={() => setMenuOpen(false)}>Blogs</Link>
          <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart</Link>
          <Link to="/signin" onClick={() => setMenuOpen(false)}>Sign In</Link>
          <Link
            to="/signup"
            onClick={() => setMenuOpen(false)}
            className="bg-green-600 text-white mx-16 py-1 rounded hover:bg-green-700"
          >
            Sign Up
          </Link>
        </nav>
      )}
    </header>
  );
}