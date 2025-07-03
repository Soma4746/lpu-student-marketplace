import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canAccessAdmin } from '../../utils/adminAccess';
import {
  Home,
  ShoppingBag,
  Palette,
  Grid3X3,
  Plus,
  Package,
  Heart,
  ShoppingCart,
  User,
  Settings,
  Shield,
  MessageCircle,
  TrendingUp,
  Star,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { state } = useAuth();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['marketplace']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const categories = [
    { name: 'Electronics', icon: '📱', path: '/marketplace?category=electronics' },
    { name: 'Books', icon: '📚', path: '/marketplace?category=books' },
    { name: 'Clothing', icon: '👕', path: '/marketplace?category=clothing' },
    { name: 'Sports', icon: '⚽', path: '/marketplace?category=sports' },
    { name: 'Stationery', icon: '✏️', path: '/marketplace?category=stationery' },
    { name: 'Furniture', icon: '🪑', path: '/marketplace?category=furniture' },
  ];

  const talentCategories = [
    { name: 'Programming', icon: '💻', path: '/talent-store?category=programming' },
    { name: 'Design', icon: '🎨', path: '/talent-store?category=design' },
    { name: 'Tutoring', icon: '📖', path: '/talent-store?category=tutoring' },
    { name: 'Writing', icon: '✍️', path: '/talent-store?category=writing' },
    { name: 'Music', icon: '🎵', path: '/talent-store?category=music' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-2 px-4">
          {/* Home */}
          <Link
            to="/"
            onClick={onClose}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/')
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Home className="h-5 w-5 mr-3" />
            Home
          </Link>

          {/* Marketplace Section */}
          <div>
            <button
              onClick={() => toggleSection('marketplace')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <div className="flex items-center">
                <ShoppingBag className="h-5 w-5 mr-3" />
                Marketplace
              </div>
              {expandedSections.includes('marketplace') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {expandedSections.includes('marketplace') && (
              <div className="ml-6 mt-2 space-y-1">
                <Link
                  to="/marketplace"
                  onClick={onClose}
                  className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive('/marketplace')
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  All Items
                </Link>
                
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    to={category.path}
                    onClick={onClose}
                    className="flex items-center px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Talent Store Section */}
          <div>
            <button
              onClick={() => toggleSection('talent')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <div className="flex items-center">
                <Palette className="h-5 w-5 mr-3" />
                Talent Store
              </div>
              {expandedSections.includes('talent') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {expandedSections.includes('talent') && (
              <div className="ml-6 mt-2 space-y-1">
                <Link
                  to="/talent-store"
                  onClick={onClose}
                  className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive('/talent-store')
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Star className="h-4 w-4 mr-2" />
                  All Services
                </Link>
                
                {talentCategories.map((category) => (
                  <Link
                    key={category.name}
                    to={category.path}
                    onClick={onClose}
                    className="flex items-center px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Authenticated User Sections */}
          {state.isAuthenticated && (
            <>
              {/* My Account Section */}
              <div>
                <button
                  onClick={() => toggleSection('account')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-3" />
                    My Account
                  </div>
                  {expandedSections.includes('account') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {expandedSections.includes('account') && (
                  <div className="ml-6 mt-2 space-y-1">
                    <Link
                      to="/dashboard"
                      onClick={onClose}
                      className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive('/dashboard')
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                    
                    <Link
                      to="/profile"
                      onClick={onClose}
                      className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive('/profile')
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Profile Settings
                    </Link>
                  </div>
                )}
              </div>

              {/* User-specific navigation (non-admin) */}
              {!canAccessAdmin(state.user) && (
                <div>
                  <button
                    onClick={() => toggleSection('shopping')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <ShoppingCart className="h-5 w-5 mr-3" />
                      My Shopping
                    </div>
                    {expandedSections.includes('shopping') ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  {expandedSections.includes('shopping') && (
                    <div className="ml-6 mt-2 space-y-1">
                      <Link
                        to="/orders"
                        onClick={onClose}
                        className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                          isActive('/orders')
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        My Orders
                      </Link>
                      
                      <Link
                        to="/wishlist"
                        onClick={onClose}
                        className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                          isActive('/wishlist')
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Wishlist
                      </Link>
                      
                      <Link
                        to="/cart"
                        onClick={onClose}
                        className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                          isActive('/cart')
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Shopping Cart
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Selling Section */}
              {!canAccessAdmin(state.user) && (
                <div>
                  <button
                    onClick={() => toggleSection('selling')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <Plus className="h-5 w-5 mr-3" />
                      Selling
                    </div>
                    {expandedSections.includes('selling') ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  {expandedSections.includes('selling') && (
                    <div className="ml-6 mt-2 space-y-1">
                      <Link
                        to="/create-item"
                        onClick={onClose}
                        className="flex items-center px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Sell an Item
                      </Link>
                      
                      <Link
                        to="/create-talent"
                        onClick={onClose}
                        className="flex items-center px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Palette className="h-4 w-4 mr-2" />
                        Offer Service
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Admin Section */}
              {canAccessAdmin(state.user) && (
                <div>
                  <button
                    onClick={() => toggleSection('admin')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 mr-3" />
                      Admin Panel
                    </div>
                    {expandedSections.includes('admin') ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  {expandedSections.includes('admin') && (
                    <div className="ml-6 mt-2 space-y-1">
                      <Link
                        to="/admin/dashboard"
                        onClick={onClose}
                        className="flex items-center px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Link>
                      
                      <Link
                        to="/admin/users"
                        onClick={onClose}
                        className="flex items-center px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4 mr-2" />
                        User Management
                      </Link>
                      
                      <Link
                        to="/admin/items"
                        onClick={onClose}
                        className="flex items-center px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Item Management
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Help & Support */}
          <Link
            to="/help"
            onClick={onClose}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/help')
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <HelpCircle className="h-5 w-5 mr-3" />
            Help & Support
          </Link>
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
