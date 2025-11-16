// src/App.jsx (MODIFIED - COMPLETE CODE)
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Plants from "./pages/Plants";
import Seeds from "./pages/Seeds";
import Pots from "./pages/Pots";
import Seller from "./pages/Seller";
import About from "./pages/About";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ExpertSupport from "./pages/ExpertSupport"; // NEW
import ExpertDashboard from "./pages/ExpertDashboard"; // NEW
import Cart from "./pages/Cart"; // NEW IMPORT
import Blog from "./pages/Blog"; // 

export default function App() {
  return (
    <BrowserRouter>
      <Header />
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
        <Route path="/cart" element={<Cart />} /> {/* NEW */}
        <Route path="/blog" element={<Blog />} /> {/* NEW */}
      </Routes>
    </BrowserRouter>
  );
}