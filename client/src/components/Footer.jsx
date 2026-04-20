import React from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand Section */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center text-green-700 dark:text-green-400 text-2xl font-black tracking-tighter">
            <FaLeaf className="mr-2 rotate-12" />
            Gardenly
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Bring Nature Closer to Home. We provide the highest quality plants, seeds, and gardening accessories straight to your door.
          </p>
          <div className="flex gap-4 pt-2">
            <a href="#" className="text-gray-400 hover:text-green-600 transition-colors"><FaFacebook size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-green-600 transition-colors"><FaTwitter size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-green-600 transition-colors"><FaInstagram size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-green-600 transition-colors"><FaLinkedin size={20} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wide">Explore</h3>
          <ul className="space-y-3 text-sm">
            <li><Link to="/plants" className="hover:text-green-600 transition-colors">Shop Plants</Link></li>
            <li><Link to="/seeds" className="hover:text-green-600 transition-colors">Buy Seeds</Link></li>
            <li><Link to="/pots" className="hover:text-green-600 transition-colors">Garden Pots</Link></li>
            <li><Link to="/custom-requests" className="hover:text-green-600 transition-colors">Custom Requests</Link></li>
          </ul>
        </div>

        {/* Community */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wide">Community</h3>
          <ul className="space-y-3 text-sm">
            <li><Link to="/about" className="hover:text-green-600 transition-colors">About Us</Link></li>
            <li><Link to="/blog" className="hover:text-green-600 transition-colors">Gardening Blog</Link></li>
            <li><Link to="/community" className="hover:text-green-600 transition-colors">Forums</Link></li>
            <li><Link to="/expert-support" className="hover:text-green-600 transition-colors">Expert Help</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wide">Contact Us</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-green-600 mt-1 flex-shrink-0" />
              <span>Sri City, Chittoor District, Andhra Pradesh, India</span>
            </li>
            <li className="flex items-center gap-3">
              <FaEnvelope className="text-green-600 flex-shrink-0" />
              <a href="mailto:sriharsharaju.y23@iiits.in" className="hover:text-green-600 transition-colors">
                sriharsharaju.y23@iiits.in
              </a>
            </li>
            <li className="flex items-center gap-3">
              <FaPhone className="text-green-600 flex-shrink-0" />
              <span>+91 98765 43210</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-sm text-center text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© {new Date().getFullYear()} Gardenly. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-green-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-green-600 transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
