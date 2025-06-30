import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { ordersAPI } from '../utils/api';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  orderId: string;
  buyer: {
    _id: string;
    name: string;
    email: string;
  };
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  item?: {
    title: string;
    images: string[];
  };
  talentProduct?: {
    name: string;
    images: string[];
  };
  type: 'item' | 'talent';
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  communication: Array<{
    from: string;
    message: string;
    timestamp: string;
    isRead: boolean;
  }>;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'buyer' | 'seller'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, [filter, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filter !== 'all') params.role = filter;
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await ordersAPI.getOrders(params);
      setOrders(response.data.data.orders);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'delivered':
        return <Package className="h-5 w-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 mb-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            My Orders
          </h1>
          <p className="text-gray-600 mt-2">
            Track and manage your orders
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View as
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Orders</option>
                <option value="buyer">As Buyer</option>
                <option value="seller">As Seller</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600">
              {filter === 'buyer' 
                ? "You haven't made any purchases yet" 
                : filter === 'seller'
                ? "You haven't received any orders yet"
                : "No orders to display"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderId || order._id.slice(-8)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        ₹{order.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Product Info */}
                    <div className="md:col-span-2">
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg mr-4">
                          {(order.item?.images?.[0] || order.talentProduct?.images?.[0]) && (
                            <img
                              src={order.item?.images?.[0] || order.talentProduct?.images?.[0]}
                              alt={order.item?.title || order.talentProduct?.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {order.item?.title || order.talentProduct?.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {order.type === 'item' ? 'Marketplace Item' : 'Talent Product'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Payment: {order.paymentMethod.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 mb-1">
                          {filter === 'seller' ? 'Buyer' : 'Seller'}:
                        </p>
                        <p className="text-gray-600">
                          {filter === 'seller' ? order.buyer.name : order.seller.name}
                        </p>
                        <p className="text-gray-600">
                          {filter === 'seller' ? order.buyer.email : order.seller.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  {order.communication && order.communication.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center mb-2">
                        <MessageCircle className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">
                          Recent Messages ({order.communication.length})
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                        {order.communication.slice(-2).map((msg, index) => (
                          <div key={index} className="text-sm mb-2 last:mb-0">
                            <span className="font-medium">
                              {msg.from === order.buyer._id ? order.buyer.name : order.seller.name}:
                            </span>
                            <span className="ml-2 text-gray-600">{msg.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex justify-end space-x-3">
                    <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <MessageCircle className="h-4 w-4 mr-2 inline" />
                      Message
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
