// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";

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
import SearchResults from "./pages/SearchResults";

/* Admin pages */
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminTickets from "./pages/AdminTickets";

/* -------- PUBLIC WEBSITE LAYOUT -------- */
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
          <Route path="/search" element={<SearchResults />} />
        </Routes>
      </div>
    </>
  );
}

/* -------- MAIN APP -------- */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ADMIN PANEL (NESTED ROUTES) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="tickets" element={<AdminTickets />} />
        </Route>

        {/* PUBLIC WEBSITE */}
        <Route path="/*" element={<PublicLayout />} />

      </Routes>
    </BrowserRouter>
  );
}