// src/pages/Blog.jsx (MODIFIED - COMPLETE CODE)
import React from "react";

const blogs = [
  {
    id: 1,
    title: "Top 10 Indoor Plants for Beginners",
    excerpt: "Discover the easiest houseplants to care for, perfect for starting your indoor garden journey. Low maintenance and air-purifying benefits included.",
    date: "2025-01-15",
    image: "/images/blogs/all1.webp",
    slug: "top-10-indoor-plants-for-beginners",
  },
  {
    id: 2,
    title: "Sustainable Gardening: Eco-Friendly Tips",
    excerpt: "Learn how to create a green thumb without harming the planet. From composting to water-saving techniques, go green the right way.",
    date: "2025-01-12",
    image: "/images/blogs/all2.webp",
    slug: "sustainable-gardening-eco-friendly-tips",
  },
  {
    id: 3,
    title: "The Benefits of Herb Gardens at Home",
    excerpt: "Grow your own fresh herbs and elevate your cooking. Rosemary, basil, and more—simple steps to a flavorful kitchen garden.",
    date: "2025-01-10",
    image: "/images/blogs/f1.webp",
    slug: "benefits-of-herb-gardens-at-home",
  },
  {
    id: 4,
    title: "Choosing the Perfect Pot for Your Plants",
    excerpt: "Not all pots are created equal. Explore materials, sizes, and drainage tips to keep your plants thriving and stylish.",
    date: "2025-01-08",
    image: "/images/blogs/f4.webp",
    slug: "choosing-perfect-pot-for-plants",
  },
  {
    id: 5,
    title: "Seasonal Seeds: What to Plant in Winter",
    excerpt: "Beat the cold with these hardy seeds. Guide to winter sowing and preparing your garden for spring blooms.",
    date: "2025-01-05",
    image: "/images/blogs/article4.webp",
    slug: "seasonal-seeds-winter-planting",
  },
  {
    id: 6,
    title: "Plant Care Myths Debunked",
    excerpt: "From overwatering to 'talking to plants'—we separate fact from fiction with science-backed advice for healthier greenery.",
    date: "2025-01-03",
    image: "/images/blogs/basic1.webp",
    slug: "plant-care-myths-debunked",
  },
  {
    id: 7,
    title: "Balcony Gardening for Urban Dwellers",
    excerpt: "Transform your small space into a lush oasis. Compact plants, vertical ideas, and sunlight hacks for city living.",
    date: "2025-01-01",
    image: "/images/blogs/image1.webp",
    slug: "balcony-gardening-urban-dwellers",
  },
];

export default function Blog() {
  return (
    <div className="pt-20 bg-[#f8faf7] dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100">
      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[400px] bg-cover bg-center flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-green-800/80 via-green-600/70 to-emerald-900/80"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/images/blogs/article1.webp')`,
          }}
        ></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            Gardening <br />
            <span className="text-green-300">Insights & Tips</span>
          </h1>
          <p className="text-lg md:text-xl mb-6 font-light max-w-2xl mx-auto drop-shadow-md">
            Explore our latest articles on plant care, sustainable practices, and green living to nurture your passion for gardening.
          </p>
        </div>
      </section>

      {/* Blogs Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-green-700 dark:text-green-400 mb-4">
            Latest Blogs
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Dive into expert advice and inspiring stories from the world of plants and sustainability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <article
              key={blog.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = "/images/fallback.png"; // Fallback image
                  }}
                />
                <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  New
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {blog.date}
                </p>
                <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {blog.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  {blog.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Additional Articles Section (using article images) */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-green-700 dark:text-green-400 mb-4">
              Featured Articles
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              In-depth guides and stories to inspire your gardening adventures.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/2">
                <img
                  src="/images/blogs/article1.webp"
                  alt="Succulent Care Guide"
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.target.src = "/images/fallback.png";
                  }}
                />
              </div>
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">2025-01-20</p>
                  <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">
                    Ultimate Succulent Care Guide
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    From propagation to pest control, everything you need to know to keep your succulents happy and healthy.
                  </p>
                </div>
              </div>
            </article>

            <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/2">
                <img
                  src="/images/blogs/article2.jpg"
                  alt="Vertical Gardens"
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.target.src = "/images/fallback.png";
                  }}
                />
              </div>
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">2025-01-18</p>
                  <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">
                    Creating Stunning Vertical Gardens
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Maximize your space with creative vertical planting ideas. Perfect for apartments and small patios.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}