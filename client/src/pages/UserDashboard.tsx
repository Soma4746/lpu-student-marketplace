import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../utils/api';
import { 
  ShoppingBag, 
  Heart, 
  Package,
  Star,
  Clock,
  DollarSign,
  Plus,
  TrendingUp,
  Eye,
  ShoppingCart,
  Bell,
  Gift
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface UserDashboardStats {
  totalPurchases: number;
  totalSales: number;
  wishlistItems: number;
  cartItems: number;
  activeListings: number;
  totalEarnings: number;
  recentOrders: any[];
  recentlyViewed: any[];
  recommendations: any[];
}

const UserDashboard: React.FC = () => {
  const { state } = useAuth();
  const [dashboardData, setDashboardData] = useState<UserDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getDashboard();
      setDashboardData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading your dashboard..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Cart Items',
      value: dashboardData?.cartItems || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      link: '/cart'
    },
    {
      title: 'Wishlist',
      value: dashboardData?.wishlistItems || 0,
      icon: Heart,
      color: 'bg-red-500',
      link: '/wishlist'
    },
    {
      title: 'My Orders',
      value: dashboardData?.totalPurchases || 0,
      icon: Package,
      color: 'bg-green-500',
      link: '/orders'
    },
    {
      title: 'My Listings',
      value: dashboardData?.activeListings || 0,
      icon: ShoppingBag,
      color: 'bg-purple-500',
      link: '/my-listings'
    },
    {
      title: 'Total Earnings',
      value: `₹${dashboardData?.totalEarnings || 0}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      link: '/earnings'
    },
    {
      title: 'Reviews',
      value: state.user?.stats?.totalRatings || 0,
      icon: Star,
      color: 'bg-orange-500',
      link: '/reviews'
    }
  ];

  const quickActions = [
    {
      title: 'Sell an Item',
      description: 'List your items for sale',
      icon: Plus,
      color: 'bg-blue-600',
      link: '/create-item'
    },
    {
      title: 'Offer a Service',
      description: 'Showcase your talents',
      icon: Gift,
      color: 'bg-purple-600',
      link: '/create-talent'
    },
    {
      title: 'Browse Marketplace',
      description: 'Find items to buy',
      icon: ShoppingBag,
      color: 'bg-green-600',
      link: '/marketplace'
    },
    {
      title: 'Explore Talents',
      description: 'Discover services',
      icon: Star,
      color: 'bg-orange-600',
      link: '/talent-store'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {state.user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your marketplace activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
              >
                <div className={`${action.color} p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <Link to="/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {dashboardData?.recentOrders?.length ? (
                dashboardData.recentOrders.slice(0, 3).map((order: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{order.title}</p>
                      <p className="text-sm text-gray-600">₹{order.amount}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent orders</p>
              )}
            </div>
          </div>

          {/* Recently Viewed */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recently Viewed</h3>
              <Link to="/recently-viewed" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {dashboardData?.recentlyViewed?.length ? (
                dashboardData.recentlyViewed.slice(0, 3).map((item: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <img 
                      src={item.image || '/placeholder-image.jpg'} 
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">₹{item.price}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recently viewed items</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
