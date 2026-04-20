import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import {
  LayoutDashboard, Users, Package, ShoppingCart,
  Ticket, LogOut, Leaf, BookOpen, Users2,
  MessageSquare, FileQuestion
} from "lucide-react";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/signin");
    else if (user.role !== "admin") navigate("/");
  }, [user, navigate]);

  if (!user || user.role !== "admin") return null;

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", to: "/admin/dashboard" },
    { icon: Users, label: "Users", to: "/admin/users" },
    { icon: Package, label: "Products", to: "/admin/products" },
    { icon: ShoppingCart, label: "Orders", to: "/admin/orders" },
    { icon: Ticket, label: "Tickets", to: "/admin/tickets" },
    { icon: BookOpen, label: "Blogs", to: "/admin/blogs" },
    { icon: Users2, label: "Communities", to: "/admin/communities" },
    { icon: MessageSquare, label: "Posts", to: "/admin/posts" },
    { icon: FileQuestion, label: "Custom Requests", to: "/admin/custom-requests" },
  ];

  return (
    <div className="min-h-screen flex bg-[#f0f4f8]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm fixed h-screen flex flex-col z-40">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Leaf size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg text-gray-800">Gardenly Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-green-50 text-green-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + Logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user.username}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate("/signin"); }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 rounded-xl hover:bg-red-50 transition font-medium"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* TOP BAR */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30">
          <h1 className="text-lg font-semibold text-gray-700">Admin Panel</h1>
          <div className="text-sm text-gray-500">
            Welcome back, <span className="font-semibold text-gray-800">{user.username}</span>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}