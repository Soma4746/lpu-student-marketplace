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
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isCollapsed ? 'w-12' : 'w-60'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Minimal Header */}
          <div className="flex items-center justify-center py-4">
            {isCollapsed ? (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex flex-col items-center justify-center w-8 h-8 text-slate-400 hover:text-white transition-colors"
                title="Open Menu"
              >
                <div className="w-4 h-0.5 bg-current mb-1"></div>
                <div className="w-4 h-0.5 bg-current mb-1"></div>
                <div className="w-4 h-0.5 bg-current"></div>
              </button>
            ) : (
              <div className="flex items-center justify-between w-full px-4">
                <span className="text-white font-semibold">Menu</span>
                <button
                  onClick={onToggleCollapse}
                  className="hidden lg:block p-1 text-slate-400 hover:text-white transition-colors"
                  title="Close Menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden absolute top-4 right-4 p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Content */}
          <div className="flex-1 overflow-y-auto">
            <nav className={`${isCollapsed ? 'px-1' : 'px-3'}`}>
              {/* Home */}
              <Link
                to="/"
                onClick={onClose}
                className={`flex items-center py-3 text-sm font-medium transition-all duration-200 group relative ${
                  isCollapsed ? 'justify-center px-1' : 'px-3'
                } ${
                  isActive('/')
                    ? 'text-blue-400'
                    : 'text-slate-300 hover:text-white'
                }`}
                title={isCollapsed ? 'Home' : ''}
              >
                <Home className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="ml-3">Home</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                    Home
                  </div>
                )}
              </Link>

              {/* Marketplace */}
              <Link
                to="/marketplace"
                onClick={onClose}
                className={`flex items-center py-3 text-sm font-medium transition-all duration-200 group relative ${
                  isCollapsed ? 'justify-center px-1' : 'px-3'
                } ${
                  isActive('/marketplace')
                    ? 'text-blue-400'
                    : 'text-slate-300 hover:text-white'
                }`}
                title={isCollapsed ? 'Marketplace' : ''}
              >
                <ShoppingBag className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="ml-3">Marketplace</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                    Marketplace
                  </div>
                )}
              </Link>

              {/* Talent Store */}
              <Link
                to="/talent-store"
                onClick={onClose}
                className={`flex items-center py-3 text-sm font-medium transition-all duration-200 group relative ${
                  isCollapsed ? 'justify-center px-1' : 'px-3'
                } ${
                  isActive('/talent-store')
                    ? 'text-blue-400'
                    : 'text-slate-300 hover:text-white'
                }`}
                title={isCollapsed ? 'Talent Store' : ''}
              >
                <Palette className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="ml-3">Talent Store</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                    Talent Store
                  </div>
                )}
              </Link>

              {/* Authenticated User Sections */}
              {state.isAuthenticated && (
                <>
                  {/* Divider */}
                  {!isCollapsed && (
                    <div className="my-3 border-t border-slate-700/30"></div>
                  )}

                  {/* Dashboard */}
                  <Link
                    to="/dashboard"
                    onClick={onClose}
                    className={`flex items-center py-3 text-sm font-medium transition-all duration-200 group relative ${
                      isCollapsed ? 'justify-center px-1' : 'px-3'
                    } ${
                      isActive('/dashboard')
                        ? 'text-blue-400'
                        : 'text-slate-300 hover:text-white'
                    }`}
                    title={isCollapsed ? 'Dashboard' : ''}
                  >
                    <User className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span className="ml-3">Dashboard</span>}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
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
                        className={`flex items-center py-3 text-sm font-medium transition-all duration-200 group relative ${
                          isCollapsed ? 'justify-center px-1' : 'px-3'
                        } ${
                          isActive('/orders')
                            ? 'text-blue-400'
                            : 'text-slate-300 hover:text-white'
                        }`}
                        title={isCollapsed ? 'My Orders' : ''}
                      >
                        <Package className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span className="ml-3">My Orders</span>}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                            My Orders
                          </div>
                        )}
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={onClose}
                        className={`flex items-center py-3 text-sm font-medium transition-all duration-200 group relative ${
                          isCollapsed ? 'justify-center px-1' : 'px-3'
                        } ${
                          isActive('/wishlist')
                            ? 'text-blue-400'
                            : 'text-slate-300 hover:text-white'
                        }`}
                        title={isCollapsed ? 'Wishlist' : ''}
                      >
                        <Heart className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span className="ml-3">Wishlist</span>}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                            Wishlist
                          </div>
                        )}
                      </Link>

                      <Link
                        to="/cart"
                        onClick={onClose}
                        className={`flex items-center py-3 text-sm font-medium transition-all duration-200 group relative ${
                          isCollapsed ? 'justify-center px-1' : 'px-3'
                        } ${
                          isActive('/cart')
                            ? 'text-blue-400'
                            : 'text-slate-300 hover:text-white'
                        }`}
                        title={isCollapsed ? 'Shopping Cart' : ''}
                      >
                        <ShoppingCart className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span className="ml-3">Shopping Cart</span>}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                            Shopping Cart
                          </div>
                        )}
                      </Link>

                      {/* Divider */}
                      {!isCollapsed && (
                        <div className="my-3 border-t border-slate-700/30"></div>
                      )}

                      {/* Create/Sell Section */}
                      <Link
                        to="/create-item"
                        onClick={onClose}
                        className={`flex items-center py-3 text-sm font-medium transition-all duration-200 group relative ${
                          isCollapsed ? 'justify-center px-1' : 'px-3'
                        } ${
                          isActive('/create-item')
                            ? 'text-green-400'
                            : 'text-slate-300 hover:text-green-400'
                        }`}
                        title={isCollapsed ? 'Sell Item' : ''}
                      >
                        <Plus className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span className="ml-3">Sell Item</span>}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                            Sell Item
                          </div>
                        )}
                      </Link>

                      <Link
                        to="/create-talent"
                        onClick={onClose}
                        className={`flex items-center py-3 text-sm font-medium transition-all duration-200 group relative ${
                          isCollapsed ? 'justify-center px-1' : 'px-3'
                        } ${
                          isActive('/create-talent')
                            ? 'text-purple-400'
                            : 'text-slate-300 hover:text-purple-400'
                        }`}
                        title={isCollapsed ? 'Offer Service' : ''}
                      >
                        <Palette className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span className="ml-3">Offer Service</span>}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
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
