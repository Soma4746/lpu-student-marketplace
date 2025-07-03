import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canAccessAdmin } from '../../utils/adminAccess';
import {
  Home,
  ShoppingBag,
  Palette,
  Plus,
  Package,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { state } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

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
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900 shadow-2xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700/50">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <h2 className="text-lg font-semibold text-white">Menu</h2>
              </div>
            )}
            {isCollapsed && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-sm">L</span>
              </div>
            )}
            <div className="flex items-center">
              {/* Desktop Toggle Button */}
              <button
                onClick={onToggleCollapse}
                className="hidden lg:block p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
                title={isCollapsed ? 'Expand Menu' : 'Collapse Menu'}
              >
                <Menu className="h-4 w-4" />
              </button>
              {/* Mobile Close Button */}
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation Content */}
          <div className="flex-1 overflow-y-auto py-3">
            <nav className={`space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
              {/* Home */}
              <Link
                to="/"
                onClick={onClose}
                className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                  isActive('/')
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
                }`}
                title={isCollapsed ? 'Home' : ''}
              >
                <Home className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
                {!isCollapsed && <span className="ml-3 font-medium">Home</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 bg-slate-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-lg">
                    Home
                  </div>
                )}
              </Link>

              {/* Marketplace */}
              <Link
                to="/marketplace"
                onClick={onClose}
                className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                  isActive('/marketplace')
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
                }`}
                title={isCollapsed ? 'Marketplace' : ''}
              >
                <ShoppingBag className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
                {!isCollapsed && <span className="ml-3 font-medium">Marketplace</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 bg-slate-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-lg">
                    Marketplace
                  </div>
                )}
              </Link>

              {/* Talent Store */}
              <Link
                to="/talent-store"
                onClick={onClose}
                className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                  isActive('/talent-store')
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
                }`}
                title={isCollapsed ? 'Talent Store' : ''}
              >
                <Palette className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
                {!isCollapsed && <span className="ml-3 font-medium">Talent Store</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 bg-slate-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-lg">
                    Talent Store
                  </div>
                )}
              </Link>

              {/* Authenticated User Sections */}
              {state.isAuthenticated && (
                <>
                  {/* Divider */}
                  {!isCollapsed && (
                    <div className="my-4 border-t border-slate-700/50"></div>
                  )}

                  {/* Dashboard */}
                  <Link
                    to="/dashboard"
                    onClick={onClose}
                    className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                      isActive('/dashboard')
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
                    }`}
                    title={isCollapsed ? 'Dashboard' : ''}
                  >
                    <User className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
                    {!isCollapsed && <span className="ml-3 font-medium">Dashboard</span>}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 bg-slate-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-lg">
                        Dashboard
                      </div>
                    )}
                  </Link>

                  {/* User-specific links for regular users */}
                  {!canAccessAdmin(state.user) && (
                    <>
                      <Link
                        to="/orders"
                        onClick={onClose}
                        className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                          isActive('/orders')
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
                        }`}
                        title={isCollapsed ? 'My Orders' : ''}
                      >
                        <Package className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
                        {!isCollapsed && <span className="ml-3 font-medium">My Orders</span>}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 bg-slate-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-lg">
                            My Orders
                          </div>
                        )}
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={onClose}
                        className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                          isActive('/wishlist')
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
                        }`}
                        title={isCollapsed ? 'Wishlist' : ''}
                      >
                        <Heart className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
                        {!isCollapsed && <span className="ml-3 font-medium">Wishlist</span>}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 bg-slate-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-lg">
                            Wishlist
                          </div>
                        )}
                      </Link>

                      <Link
                        to="/cart"
                        onClick={onClose}
                        className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                          isActive('/cart')
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
                        }`}
                        title={isCollapsed ? 'Shopping Cart' : ''}
                      >
                        <ShoppingCart className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
                        {!isCollapsed && <span className="ml-3 font-medium">Shopping Cart</span>}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 bg-slate-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-lg">
                            Shopping Cart
                          </div>
                        )}
                      </Link>

                      {/* Divider */}
                      {!isCollapsed && (
                        <div className="my-4 border-t border-slate-700/50"></div>
                      )}

                      {/* Create/Sell Section */}
                      <Link
                        to="/create-item"
                        onClick={onClose}
                        className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                          isActive('/create-item')
                            ? 'bg-green-600 text-white shadow-md'
                            : 'text-slate-300 hover:bg-green-600/20 hover:text-green-300'
                        }`}
                        title={isCollapsed ? 'Sell Item' : ''}
                      >
                        <Plus className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
                        {!isCollapsed && <span className="ml-3 font-medium">Sell Item</span>}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 bg-slate-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-lg">
                            Sell Item
                          </div>
                        )}
                      </Link>

                      <Link
                        to="/create-talent"
                        onClick={onClose}
                        className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                          isActive('/create-talent')
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-slate-300 hover:bg-purple-600/20 hover:text-purple-300'
                        }`}
                        title={isCollapsed ? 'Offer Service' : ''}
                      >
                        <Palette className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
                        {!isCollapsed && <span className="ml-3 font-medium">Offer Service</span>}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 bg-slate-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-lg">
                            Offer Service
                          </div>
                        )}
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
