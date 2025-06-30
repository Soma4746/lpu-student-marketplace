import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  Star, 
  TrendingUp, 
  AlertCircle,
  Activity,
  DollarSign,
  ShoppingBag
} from 'lucide-react';
import { authAPI } from '../../utils/api';

interface DashboardStats {
  stats: {
    users: {
      total: number;
      active: number;
      growthRate: number;
    };
    items: {
      total: number;
      active: number;
      sold: number;
      growthRate: number;
    };
    talentProducts: number;
    orders: {
      total: number;
      growthRate: number;
    };
    categories: number;
  };
  recent: {
    users: any[];
    items: any[];
    orders: any[];
  };
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await authAPI.get('/admin/dashboard');
      setStats(response.data.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, growth, color }: any) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {growth && (
            <p className={`text-sm ${growth > 0 ? 'text-green-600' : 'text-red-600'} flex items-center`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              {growth > 0 ? '+' : ''}{growth}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome to LPU Student Marketplace Admin Panel</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Users"
                value={stats.stats.users.total}
                icon={Users}
                growth={stats.stats.users.growthRate}
                color="bg-blue-500"
              />
              <StatCard
                title="Active Items"
                value={stats.stats.items.active}
                icon={Package}
                growth={stats.stats.items.growthRate}
                color="bg-green-500"
              />
              <StatCard
                title="Talent Products"
                value={stats.stats.talentProducts}
                icon={Star}
                color="bg-purple-500"
              />
              <StatCard
                title="Total Orders"
                value={stats.stats.orders.total}
                icon={ShoppingBag}
                growth={stats.stats.orders.growthRate}
                color="bg-orange-500"
              />
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Users</span>
                    <span className="font-semibold">{stats.stats.users.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Users</span>
                    <span className="font-semibold">{stats.stats.users.total}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items Sold</span>
                    <span className="font-semibold">{stats.stats.items.sold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Items</span>
                    <span className="font-semibold">{stats.stats.items.active}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categories</span>
                    <span className="font-semibold">{stats.stats.categories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Talent Products</span>
                    <span className="font-semibold">{stats.stats.talentProducts}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
                <div className="space-y-3">
                  {stats.recent.users.map((user: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Items</h3>
                <div className="space-y-3">
                  {stats.recent.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-600">₹{item.price}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
