import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canAccessAdmin } from '../../utils/adminAccess';
import {
  Search,
  ShoppingBag,
  Palette,
  User,
  Menu,
  X,
  Plus,
  LogOut,
  Settings,
  Heart,
  Shield,
  ShoppingCart,
  Package,
  Bell,
  Star,
  Grid3X3,
  TrendingUp,
  Clock,
  MapPin
} from 'lucide-react';

interface NavbarProps {
  onMenuToggle?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { state, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  // Mock data for cart and wishlist counts (replace with real data later)
  const cartCount = 3;
  const wishlistCount = 7;
  const notificationCount = 2;

  const categories = [
    { name: 'Electronics', icon: '📱', path: '/marketplace?category=electronics' },
    { name: 'Books', icon: '📚', path: '/marketplace?category=books' },
    { name: 'Clothing', icon: '👕', path: '/marketplace?category=clothing' },
    { name: 'Sports', icon: '⚽', path: '/marketplace?category=sports' },
    { name: 'Stationery', icon: '✏️', path: '/marketplace?category=stationery' },
    { name: 'Programming', icon: '💻', path: '/talent-store?category=programming' },
    { name: 'Design', icon: '🎨', path: '/talent-store?category=design' },
    { name: 'Tutoring', icon: '📖', path: '/talent-store?category=tutoring' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Menu Button + Logo */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">LPU Marketplace</span>
            </Link>
          </div>

          {/* Center - Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search items, talent, or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>
          </div>

          {/* Right Side - Essential Actions */}
          <div className="flex items-center space-x-4">
            {/* Get Started / Create Button */}
            {state.isAuthenticated ? (
              <Link
                to="/purpose"
                className="hidden md:flex items-center space-x-1 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create</span>
              </Link>
            ) : (
              <Link
                to="/purpose"
                className="hidden md:flex items-center space-x-1 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Get Started</span>
              </Link>
            )}

            {/* Essential Action Buttons */}
            {state.isAuthenticated && (
              <div className="flex items-center space-x-2">
                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-full transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </Link>

                {/* Wishlist - Only for regular users */}
                {!canAccessAdmin(state.user) && (
                  <Link
                    to="/wishlist"
                    className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-full transition-colors"
                  >
                    <Heart className="h-5 w-5" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Cart - Only for regular users */}
                {!canAccessAdmin(state.user) && (
                  <Link
                    to="/cart"
                    className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-full transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            )}

            {/* Profile Dropdown */}
            {state.isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-50 transition-colors"
                >
                  {state.user?.avatar ? (
                    <img
                      src={state.user.avatar}
                      alt={state.user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {state.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg">
                      <div className="py-1">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{state.user?.name}</p>
                          <p className="text-xs text-gray-500">{state.user?.email}</p>
                        </div>
                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          <span>{canAccessAdmin(state.user) ? 'Admin Dashboard' : 'Dashboard'}</span>
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Profile Settings</span>
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Package className="h-4 w-4" />
                          <span>My Orders</span>
                        </Link>
                        {/* Admin Panel Link */}
                        {canAccessAdmin(state.user) && (
                          <Link
                            to="/admin"
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <Shield className="h-4 w-4" />
                            <span>Admin Panel</span>
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
  );
};

export default Navbar;
