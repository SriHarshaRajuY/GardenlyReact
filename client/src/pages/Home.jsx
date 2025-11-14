import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import ProductDetail from "../components/ProductDetail";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [detailProduct, setDetailProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      // USE PROXY → /api/products = backend /api/products
      const res = await fetch("/api/products?limit=12", { credentials: "include" });
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        setProducts(data);
      } else {
        throw new Error("Failed");
      }
    } catch (err) {
      console.error("Fetch failed, using fallback:", err);
      setProducts([
        {
          _id: 1,
          name: "Money Plant Golden",
          category: "Plants",
          price: 199,
          quantity: 20,
          image: "/images/new-products/p6.jpg",
        },
        {
          _id: 2,
          name: "Rosemary - Plant",
          category: "Plants",
          price: 299,
          quantity: 12,
          image: "/images/plantspics/p5.png",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const openDetail = (p) => setDetailProduct(p);
  const closeDetail = () => setDetailProduct(null);

  const slides = [
    "/images/homeslider/h1.png",
    "/images/homeslider/h2.png",
    "/images/homeslider/h3.png",
  ];

  const categories = [
    { name: "PLANTS", img: "/images/category-badges/plants-badge.png", link: "/plants" },
    { name: "SEEDS", img: "/images/category-badges/seeds-badge.png", link: "/seeds" },
    { name: "POTS", img: "/images/category-badges/pots-badge.png", link: "/pots" },
  ];

  return (
    <div className="pt-20 bg-[#f8faf7] min-h-screen text-gray-800">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000 }}
          loop
          className="rounded-2xl overflow-hidden shadow-xl"
        >
          {slides.map((s, idx) => (
            <SwiperSlide key={idx}>
              <div
                className="relative h-[420px] md:h-[520px] bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: `url(${s})` }}
              >
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="relative z-10 text-center text-white px-4">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                    Bring Nature <br />
                    <span className="text-green-400">Closer to Home</span>
                  </h1>
                  <p className="text-lg mb-6 font-light drop-shadow-md">
                    Fresh plants, stylish pots, and seeds for your green space
                  </p>
                  <a
                    href="#shop"
                    className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg shadow-lg text-white transition"
                  >
                    Shop Now
                  </a>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Category Circles */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <h3 className="text-2xl md:text-3xl font-semibold text-center mb-10 text-green-700">
          Shop by Category
        </h3>
        <div className="flex flex-wrap justify-center gap-10">
          {categories.map((cat, i) => (
            <a
              key={i}
              href={cat.link}
              className="flex flex-col items-center gap-3 hover:scale-110 transition-transform duration-300"
            >
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full shadow-lg overflow-hidden border-4 border-green-200 bg-white flex items-center justify-center">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-24 h-24 object-contain"
                  onError={(e) => (e.target.src = "/images/fallback.png")}
                />
              </div>
              <p className="text-base font-semibold text-gray-700">{cat.name}</p>
            </a>
          ))}
        </div>
      </section>

      {/* NEW PRODUCTS */}
      <section id="shop" className="max-w-7xl mx-auto px-4 py-10 bg-white rounded-2xl shadow-lg mb-20">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-10">
          NEW PRODUCTS
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} onOpenDetail={openDetail} />
            ))}
          </div>
        )}
      </section>

      {/* Product Detail Modal */}
      {detailProduct && <ProductDetail product={detailProduct} onClose={closeDetail} />}
    </div>
  );
}