import React, { useEffect, useState } from "react";
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

  const API_URL = "http://localhost:3000"; // backend base URL

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch(`${API_URL}/api/products/recent?limit=12`);
      const data = await res.json();
      if (res.ok && data.success) setProducts(data.products);
      else throw new Error("Failed to fetch products");
    } catch (err) {
      console.error("⚠️ Using fallback demo products:", err.message);
      setProducts([
        {
          _id: 1,
          name: "Money Plant Golden",
          category: "Plants",
          price: 199,
          quantity: 20,
          image: `${API_URL}/images/new-products/p6.jpg`,
        },
        {
          _id: 2,
          name: "Rosemary - Plant",
          category: "Plants",
          price: 299,
          quantity: 12,
          image: `${API_URL}/images/plantspics/p5.png`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const openDetail = (p) => setDetailProduct(p);
  const closeDetail = () => setDetailProduct(null);

  // 🌿 Hero banner slider
  const slides = [
    `${API_URL}/images/homeslider/h1.png`,
    `${API_URL}/images/homeslider/h2.png`,
    `${API_URL}/images/homeslider/h3.png`,
  ];

  // 🌸 Categories
  const categories = [
    {
      name: "PLANTS",
      img: `${API_URL}/images/category-badges/plants-badge.png`,
      link: "/plants",
    },
    {
      name: "SEEDS",
      img: `${API_URL}/images/category-badges/seeds-badge.png`,
      link: "/seeds",
    },
    {
      name: "POTS",
      img: `${API_URL}/images/category-badges/pots-badge.png`,
      link: "/pots",
    },
  ];

  return (
    <div className="pt-20 bg-[#f8faf7] min-h-screen text-gray-800">
      {/* 🌿 Hero Section */}
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
                    Bring Nature <br />{" "}
                    <span className="text-green-400">Closer to Home</span>
                  </h1>
                  <p className="text-lg mb-6 font-light drop-shadow-md">
                    Fresh plants, stylish pots, and seeds for your green space 🌱
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

      {/* 🌸 Category Circles */}
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
                  onError={(e) => (e.target.style.opacity = 0.2)}
                />
              </div>
              <p className="text-base font-semibold text-gray-700">
                {cat.name}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* 🛒 New Products */}
      <section
        id="shop"
        className="max-w-7xl mx-auto px-4 py-10 bg-white rounded-2xl shadow-lg mb-20"
      >
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
              <div
                key={p._id}
                onClick={() => openDetail(p)}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-transform hover:-translate-y-1 duration-300 product-card"
              >
                <div className="h-56 bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      p.image?.startsWith("./public")
                        ? `${API_URL}${p.image.slice(1)}`
                        : `${API_URL}${p.image || "/images/placeholder.png"}`
                    }
                    alt={p.name}
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) =>
                      (e.target.src = `${API_URL}/images/placeholder.png`)
                    }
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {p.name}
                  </h3>
                  <p className="text-sm text-gray-500">{p.category}</p>
                  <div className="flex justify-center items-center gap-2 mt-2">
                    <span className="text-green-700 text-lg font-bold">
                      ₹{p.price}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {p.quantity > 0 ? p.quantity : "Out of Stock"}
                  </p>
                  <button className="mt-4 bg-green-700 text-white text-sm px-4 py-2 rounded-md hover:bg-green-800 transition-all w-full">
                    Add To Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {detailProduct && (
        <ProductDetail product={detailProduct} onClose={closeDetail} />
      )}
    </div>
  );
}
