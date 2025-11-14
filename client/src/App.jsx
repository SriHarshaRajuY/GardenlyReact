import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Plants from "./pages/Plants";
import Seeds from "./pages/Seeds";
import Pots from "./pages/Pots";
import Seller from "./pages/Seller";           // ← Only /seller
import About from "./pages/About";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Header from "./components/Header";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plants" element={<Plants />} />
        <Route path="/seeds" element={<Seeds />} />
        <Route path="/pots" element={<Pots />} />
        <Route path="/seller" element={<Seller />} />  {/* ← Only this */}
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}