import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import AuthProvider from "./context/AuthProvider";
import CartProvider from "./context/CartProvider";
import { SocketProvider } from "./context/SocketContext";

/* Public pages */
import Home from "./pages/Home";
import Plants from "./pages/Plants";
import Seeds from "./pages/Seeds";
import Pots from "./pages/Pots";
import Seller from "./pages/Seller";
import About from "./pages/About";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ExpertSupport from "./pages/ExpertSupport";
import ExpertDashboard from "./pages/ExpertDashboard";
import Cart from "./pages/Cart";
import Blog from "./pages/Blog";
import Community from "./pages/Community";
import SearchResults from "./pages/SearchResults";
import CustomRequests from "./pages/CustomRequests";

/* Admin pages */
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminTickets from "./pages/AdminTickets";

function PublicLayout() {
  return (
    <>
      <Header />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plants" element={<Plants />} />
          <Route path="/seeds" element={<Seeds />} />
          <Route path="/pots" element={<Pots />} />
          <Route path="/seller" element={<Seller />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/expert-support" element={<ExpertSupport />} />
          <Route path="/expert-dashboard" element={<ExpertDashboard />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/community" element={<Community />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/custom-requests" element={<CustomRequests />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <SocketProvider>
            <Routes>
              {/* ADMIN PANEL */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="tickets" element={<AdminTickets />} />
              </Route>

              {/* PUBLIC WEBSITE */}
              <Route path="/*" element={<PublicLayout />} />
            </Routes>
          </SocketProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}