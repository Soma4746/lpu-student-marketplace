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
    <nav className="bg-white shadow-lg border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Menu Button + Logo */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-md text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold text-slate-800 hidden sm:block">LPU Marketplace</span>
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
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-slate-700 placeholder-slate-500"
                />
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              </div>
            </form>
          </div>

          {/* Right Side - Essential Actions */}
          <div className="flex items-center space-x-4">
            {/* Get Started / Create Button */}
            {state.isAuthenticated ? (
              <Link
                to="/purpose"
                className="hidden md:flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4" />
                <span>Create</span>
              </Link>
            ) : (
              <Link
                to="/purpose"
                className="hidden md:flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4" />
                <span>Get Started</span>
              </Link>
            )}

            {/* Essential Action Buttons */}
            {state.isAuthenticated && (
              <div className="flex items-center space-x-1">
                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-3 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all duration-200"
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                      {notificationCount}
                    </span>
                  )}
                </Link>

                {/* Wishlist - Only for regular users */}
                {!canAccessAdmin(state.user) && (
                  <Link
                    to="/wishlist"
                    className="relative p-3 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all duration-200"
                  >
                    <Heart className="h-5 w-5" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Cart - Only for regular users */}
                {!canAccessAdmin(state.user) && (
                  <Link
                    to="/cart"
                    className="relative p-3 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all duration-200"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
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
                  className="flex items-center space-x-2 p-2 rounded-xl hover:bg-slate-100 transition-all duration-200"
                >
                  {state.user?.avatar ? (
                    <img
                      src={state.user.avatar}
                      alt={state.user.name}
                      className="h-9 w-9 rounded-xl object-cover ring-2 ring-slate-200"
                    />
                  ) : (
                    <div className="h-9 w-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-semibold">
                        {state.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                          <p className="text-sm font-semibold text-slate-900">{state.user?.name}</p>
                          <p className="text-xs text-slate-600">{state.user?.email}</p>
                        </div>
                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          <span>{canAccessAdmin(state.user) ? 'Admin Dashboard' : 'Dashboard'}</span>
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
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
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-slate-600 hover:text-blue-600 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-slate-100"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
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
