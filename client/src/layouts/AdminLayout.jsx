import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { LayoutDashboard, Users, ShoppingCart, Package, Ticket } from "lucide-react";

export default function AdminLayout() {
const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Protect admin routes
  useEffect(() => {
    if (!user) navigate("/signin");
    else if (user.role !== "admin") navigate("/");
  }, [user, navigate]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen flex bg-[#f4f7fb]">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r shadow-sm fixed h-screen">
        <div className="h-16 flex items-center px-6 border-b font-bold text-xl text-green-700">
          🌿 Gardenly Admin
        </div>

        <nav className="p-4 space-y-1 text-sm">

         <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/admin/dashboard" />
<SidebarItem icon={Users} label="Users" to="/admin/users" />
<SidebarItem icon={Package} label="Products" to="/admin/products" />
{/* <SidebarItem icon={ShoppingCart} label="Orders" to="/admin/orders" />
<SidebarItem icon={Ticket} label="Tickets" to="/admin/tickets" /> */}


        </nav>
      </aside>

      {/* PAGE CONTENT */}
      <div className="flex-1 ml-64">
        
        {/* TOP BAR */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
  <h1 className="font-semibold text-gray-700">Admin Panel</h1>

  <div className="flex items-center gap-5 text-sm">
    <span className="text-gray-500">
      Logged in as <span className="font-medium text-gray-700">{user.username}</span>
    </span>

    <button
      onClick={() => {
        logout();          // clear cookie + context
        navigate("/signin");
      }}
      className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
    >
      Logout
    </button>
  </div>
</header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ---------- Sidebar Item ---------- */
function SidebarItem({ icon: Icon, label, to }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg transition
        ${isActive
          ? "bg-green-100 text-green-700 font-semibold"
          : "text-gray-700 hover:bg-gray-100"}`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}