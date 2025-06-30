import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold">LPU Marketplace</span>
            </div>
            <p className="text-gray-300 text-sm">
              The ultimate marketplace for LPU students to buy, sell, and showcase their talents. 
              Connect with fellow students and discover amazing products and services.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/marketplace" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/talent-store" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Talent Store
                </Link>
              </li>
              <li>
                <Link to="/create-item" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Sell an Item
                </Link>
              </li>
              <li>
                <Link to="/create-talent" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Create Talent Product
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Popular Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/marketplace?category=books" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Books & Study Material
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=electronics" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/talent-store?category=Art" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Art & Design
                </Link>
              </li>
              <li>
                <Link to="/talent-store?category=Code" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Programming
                </Link>
              </li>
              <li>
                <Link to="/talent-store?category=Tutoring" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Tutoring
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  Lovely Professional University<br />
                  Phagwara, Punjab 144411
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary-400 flex-shrink-0" />
                <a href="mailto:support@lpumarketplace.com" className="text-gray-300 hover:text-white transition-colors text-sm">
                  support@lpumarketplace.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary-400 flex-shrink-0" />
                <a href="tel:+911824517000" className="text-gray-300 hover:text-white transition-colors text-sm">
                  +91 1824-517000
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 LPU Marketplace. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
              <Link to="/help" className="text-gray-400 hover:text-white transition-colors text-sm">
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
