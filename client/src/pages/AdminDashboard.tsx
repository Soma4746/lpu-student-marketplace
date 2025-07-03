import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../utils/api';
import { 
  Users, 
  ShoppingBag, 
  DollarSign,
  TrendingUp,
  Package,
  Star,
  AlertTriangle,
  Eye,
  BarChart3,
  Settings,
  Shield,
  Activity,
  Calendar,
  FileText
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalItems: number;
  activeItems: number;
  totalOrders: number;
  totalRevenue: number;
  pendingReports: number;
  newUsersToday: number;
  salesThisMonth: number;
  recentUsers: any[];
  recentOrders: any[];
  topSellingItems: any[];
}

const AdminDashboard: React.FC = () => {
  const { state } = useAuth();
  const [dashboardData, setDashboardData] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading admin dashboard..." />;
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
      title: 'Total Users',
      value: dashboardData?.totalUsers || 0,
      change: `+${dashboardData?.newUsersToday || 0} today`,
      icon: Users,
      color: 'bg-blue-500',
      link: '/admin/users'
    },
    {
      title: 'Active Items',
      value: dashboardData?.activeItems || 0,
      change: `${dashboardData?.totalItems || 0} total`,
      icon: Package,
      color: 'bg-green-500',
      link: '/admin/items'
    },
    {
      title: 'Total Orders',
      value: dashboardData?.totalOrders || 0,
      change: `₹${dashboardData?.salesThisMonth || 0} this month`,
      icon: ShoppingBag,
      color: 'bg-purple-500',
      link: '/admin/orders'
    },
    {
      title: 'Revenue',
      value: `₹${dashboardData?.totalRevenue || 0}`,
      change: '+12% from last month',
      icon: DollarSign,
      color: 'bg-yellow-500',
      link: '/admin/analytics'
    },
    {
      title: 'Pending Reports',
      value: dashboardData?.pendingReports || 0,
      change: 'Needs attention',
      icon: AlertTriangle,
      color: 'bg-red-500',
      link: '/admin/reports'
    },
    {
      title: 'Active Users',
      value: dashboardData?.activeUsers || 0,
      change: `${Math.round(((dashboardData?.activeUsers || 0) / (dashboardData?.totalUsers || 1)) * 100)}% of total`,
      icon: Activity,
      color: 'bg-indigo-500',
      link: '/admin/analytics'
    }
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: Users,
      color: 'bg-blue-600',
      link: '/admin/users'
    },
    {
      title: 'Item Moderation',
      description: 'Review and moderate listings',
      icon: Package,
      color: 'bg-green-600',
      link: '/admin/items'
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics',
      icon: BarChart3,
      color: 'bg-purple-600',
      link: '/admin/analytics'
    },
    {
      title: 'Reports',
      description: 'Handle user reports',
      icon: AlertTriangle,
      color: 'bg-red-600',
      link: '/admin/reports'
    },
    {
      title: 'Categories',
      description: 'Manage categories',
      icon: FileText,
      color: 'bg-orange-600',
      link: '/admin/categories'
    },
    {
      title: 'Settings',
      description: 'System configuration',
      icon: Settings,
      color: 'bg-gray-600',
      link: '/admin/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Welcome back, {state.user?.name}. Here's your marketplace overview.
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
              <Link to="/admin/users" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {dashboardData?.recentUsers?.length ? (
                dashboardData.recentUsers.slice(0, 5).map((user: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium text-sm">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent users</p>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <Link to="/admin/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {dashboardData?.recentOrders?.length ? (
                dashboardData.recentOrders.slice(0, 5).map((order: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">₹{order.amount} • {order.buyer}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
