import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaLeaf, FaBars, FaTimes, FaSearch, FaShoppingCart, FaChevronDown } from "react-icons/fa";
import { RiMoonLine, RiSunLine } from "react-icons/ri";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("selected-theme") === "dark"
  );
  const [searchTerm, setSearchTerm] = useState("");

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
    if (e.key === "Enter") handleSearch();
  };

  const NavLinks = ({ isMobile = false }) => {
    if (user?.role === "seller") {
      return (
        <>
          <Link to="/profile#orders" onClick={() => isMobile && setMenuOpen(false)} className="hover:text-green-600 transition font-medium">Orders</Link>
          <Link to="/custom-requests" onClick={() => isMobile && setMenuOpen(false)} className="hover:text-green-600 transition font-medium">Requests</Link>
          <Link to="/seller" onClick={() => isMobile && setMenuOpen(false)} className="hover:text-green-600 transition font-medium text-green-700 dark:text-green-400">Add Product</Link>
          <button onClick={() => { handleLogout(); if (isMobile) setMenuOpen(false); }} className="hover:text-red-500 transition font-medium">Logout</button>
        </>
      );
    }
    
    if (user?.role === "expert") {
      return (
        <>
          <Link to="/expert-dashboard" onClick={() => isMobile && setMenuOpen(false)} className="hover:text-green-600 transition font-medium">Dashboard</Link>
          <Link to="/blog" onClick={() => isMobile && setMenuOpen(false)} className="hover:text-green-600 transition font-medium">Blogs</Link>
          <button onClick={() => { handleLogout(); if (isMobile) setMenuOpen(false); }} className="hover:text-red-500 transition font-medium">Logout</button>
        </>
      );
    }

    return (
      <>
        <Link to="/" onClick={() => isMobile && setMenuOpen(false)} className="hover:text-green-600 transition font-medium">Home</Link>
        
        {/* Dropdown for Community/Resources */}
        <div className="relative group">
          <button 
            className="flex items-center gap-1 hover:text-green-600 transition font-medium"
            onClick={() => !isMobile && setDropdownOpen(!dropdownOpen)}
          >
            Explore <FaChevronDown size={10} className="group-hover:rotate-180 transition-transform" />
          </button>
          <div className={`${isMobile ? "pl-4 flex flex-col gap-2 mt-2" : "absolute top-full left-0 w-48 bg-white dark:bg-gray-900 shadow-xl rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 border dark:border-gray-800"}`}>
            <Link to="/blog" onClick={() => { setMenuOpen(false); setDropdownOpen(false); }} className="px-4 py-2 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 block transition">Blogs</Link>
            <Link to="/community" onClick={() => { setMenuOpen(false); setDropdownOpen(false); }} className="px-4 py-2 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 block transition">Community</Link>
            <Link to="/expert-support" onClick={() => { setMenuOpen(false); setDropdownOpen(false); }} className="px-4 py-2 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 block transition">Expert Help</Link>
          </div>
        </div>

        <Link to="/custom-requests" onClick={() => isMobile && setMenuOpen(false)} className="hover:text-green-600 transition font-medium">Market</Link>
        <Link to="/about" onClick={() => isMobile && setMenuOpen(false)} className="hover:text-green-600 transition font-medium">About</Link>
        
        <Link to="/cart" onClick={() => isMobile && setMenuOpen(false)} className="flex items-center gap-2 hover:text-green-600 transition font-bold bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full text-green-700 dark:text-green-400">
          <FaShoppingCart /> {cartCount > 0 && <span>{cartCount}</span>}
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/profile" onClick={() => isMobile && setMenuOpen(false)} className="hover:text-green-600 font-bold border-l pl-4 dark:border-gray-700">{user.username}</Link>
            <button onClick={() => { handleLogout(); if (isMobile) setMenuOpen(false); }} className="text-gray-400 hover:text-red-500 transition"><FaTimes /></button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/signin" onClick={() => isMobile && setMenuOpen(false)} className="px-4 py-1.5 hover:text-green-600 font-medium transition">Sign In</Link>
            <Link to="/signup" onClick={() => isMobile && setMenuOpen(false)} className="bg-green-600 text-white px-5 py-1.5 rounded-full font-bold hover:bg-green-700 transition shadow-lg shadow-green-200 dark:shadow-none">Join</Link>
          </div>
        )}
      </>
    );
  };

  return (
    <header className="bg-white/80 dark:bg-black/80 backdrop-blur-md text-gray-800 dark:text-white shadow-sm fixed w-full z-[100] border-b dark:border-gray-800">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 py-4">
        
        {/* Logo */}
        <Link to="/" className="flex items-center text-green-700 dark:text-green-400 text-2xl font-black tracking-tighter">
          <FaLeaf className="mr-2 rotate-12" />
          Gardenly
        </Link>

        {/* 🔍 Search (Minimalist) */}
        {user?.role !== "seller" && (
          <div className="hidden lg:flex items-center bg-gray-100 dark:bg-gray-900 border-none rounded-2xl px-4 py-2 w-80 group focus-within:ring-2 focus-within:ring-green-500 transition">
            <input
              type="text"
              placeholder="Search seeds, plants..."
              className="bg-transparent outline-none text-sm w-full dark:text-white placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKey}
            />
            <button onClick={handleSearch}>
              <FaSearch className="text-gray-400 group-focus-within:text-green-600 transition" />
            </button>
          </div>
        )}

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLinks />
          <button onClick={toggleDarkMode} className="text-xl text-gray-400 hover:text-yellow-500 transition">
            {darkMode ? <RiSunLine /> : <RiMoonLine />}
          </button>
        </nav>

        {/* Mobile Actions */}
        <div className="md:hidden flex items-center gap-4">
           <button onClick={toggleDarkMode} className="text-xl text-gray-400">
            {darkMode ? <RiSunLine /> : <RiMoonLine />}
          </button>
          <button className="text-2xl text-green-700" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden bg-white dark:bg-gray-950 border-t dark:border-gray-800 p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
          <NavLinks isMobile />
        </nav>
      )}
    </header>
  );
}