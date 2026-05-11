import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import { SocketProvider } from "./context/SocketContext";

/* Loading Component */
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
  </div>
);

/* Lazy Loaded Public pages */
const Home = lazy(() => import("./pages/Home"));
const Plants = lazy(() => import("./pages/Plants"));
const Seeds = lazy(() => import("./pages/Seeds"));
const Pots = lazy(() => import("./pages/Pots"));
const Seller = lazy(() => import("./pages/Seller"));
const About = lazy(() => import("./pages/About"));
const Profile = lazy(() => import("./pages/Profile"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const ExpertSupport = lazy(() => import("./pages/ExpertSupport"));
const ExpertDashboard = lazy(() => import("./pages/ExpertDashboard"));
const Cart = lazy(() => import("./pages/Cart"));
const Blog = lazy(() => import("./pages/Blog"));
const Community = lazy(() => import("./pages/Community"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const CustomRequests = lazy(() => import("./pages/CustomRequests"));

/* Lazy Loaded Admin pages */
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminTickets = lazy(() => import("./pages/AdminTickets"));
const AdminBlogs = lazy(() => import("./pages/AdminBlogs"));
const AdminCommunities = lazy(() => import("./pages/AdminCommunities"));
const AdminCommunityPosts = lazy(() => import("./pages/AdminCommunityPosts"));
const AdminCustomRequests = lazy(() => import("./pages/AdminCustomRequests"));

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="pt-16 flex-grow">
        <Suspense fallback={<LoadingSpinner />}>
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
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SocketProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* ADMIN PANEL */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="tickets" element={<AdminTickets />} />
                <Route path="blogs" element={<AdminBlogs />} />
                <Route path="communities" element={<AdminCommunities />} />
                <Route path="posts" element={<AdminCommunityPosts />} />
                <Route path="custom-requests" element={<AdminCustomRequests />} />
              </Route>

              {/* PUBLIC WEBSITE */}
              <Route path="/*" element={<PublicLayout />} />
            </Routes>
          </Suspense>
        </SocketProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}