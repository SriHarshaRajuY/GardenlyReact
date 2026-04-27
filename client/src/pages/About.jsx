import React from "react";
import { FaLeaf, FaHandsHelping, FaGlobeAmericas, FaShieldAlt } from "react-icons/fa";

export default function About() {
  const features = [
    { icon: <FaLeaf className="text-green-500" />, title: "Eco Friendly", desc: "We prioritize sustainable practices and organic gardening solutions." },
    { icon: <FaHandsHelping className="text-blue-500" />, title: "Community Driven", desc: "Connecting passionate gardeners and experts across the country." },
    { icon: <FaGlobeAmericas className="text-emerald-500" />, title: "Global Vision", desc: "Making the world greener, one plant at a time." },
    { icon: <FaShieldAlt className="text-yellow-500" />, title: "Verified Sellers", desc: "All our plants come from certified and trusted local nurseries." }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 dark:text-white mb-6">
            About <span className="text-green-600">Gardenly</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Gardenly is your premium destination for everything green. We are more than just a marketplace;
            we are a ecosystem designed to foster a love for nature and provide expert guidance for your gardening journey.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-32">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-green-200 dark:bg-green-900/30 rounded-full blur-3xl opacity-50"></div>
            <img
              src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              alt="Gardening"
              className="rounded-2xl shadow-2xl relative z-10 hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Our mission is to empower individuals to create their own green spaces, regardless of their living situation.
              We believe that gardening should be accessible and rewarding for everyone.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-3xl font-bold text-green-600 mb-2">50k+</div>
                <div className="text-sm text-gray-500">Happy Gardeners</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-3xl font-bold text-green-600 mb-2">10k+</div>
                <div className="text-sm text-gray-500">Verified Plants</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-b-4 border-green-500">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}