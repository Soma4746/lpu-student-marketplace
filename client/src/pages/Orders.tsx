import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Star,
  MessageCircle,
  Download,
  RefreshCw,
  Eye,
  ShoppingBag
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: {
    id: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
    seller: string;
  }[];
  deliveryAddress: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

const Orders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'delivered'>('all');

  // Mock orders data
  const [orders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'LPU-2024-001',
      date: '2024-01-15',
      status: 'delivered',
      total: 46800,
      items: [
        {
          id: '1',
          title: 'iPhone 13 - Excellent Condition',
          price: 45000,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300',
          seller: 'Rahul Sharma'
        },
        {
          id: '2',
          title: 'Data Structures Book',
          price: 1800,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300',
          seller: 'Priya Patel'
        }
      ],
      deliveryAddress: 'Boys Hostel 1, Room A-101, LPU Campus',
      estimatedDelivery: '2024-01-18',
      trackingNumber: 'TRK123456789'
    },
    {
      id: '2',
      orderNumber: 'LPU-2024-002',
      date: '2024-01-20',
      status: 'shipped',
      total: 15000,
      items: [
        {
          id: '3',
          title: 'Wireless Headphones - Sony WH-1000XM4',
          price: 15000,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
          seller: 'Arjun Singh'
        }
      ],
      deliveryAddress: 'Girls Hostel 2, Room B-205, LPU Campus',
      estimatedDelivery: '2024-01-25',
      trackingNumber: 'TRK987654321'
    },
    {
      id: '3',
      orderNumber: 'LPU-2024-003',
      date: '2024-01-22',
      status: 'confirmed',
      total: 3500,
      items: [
        {
          id: '4',
          title: 'Study Table with Chair',
          price: 3500,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300',
          seller: 'Furniture Store LPU'
        }
      ],
      deliveryAddress: 'Off Campus - Sector 37, Jalandhar',
      estimatedDelivery: '2024-01-28'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <Package className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <RefreshCw className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return ['pending', 'confirmed', 'shipped'].includes(order.status);
    if (activeTab === 'delivered') return order.status === 'delivered';
    return true;
  });

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <Package className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Start Shopping
            </Link>
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
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">
            Track and manage your orders
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Orders', count: orders.length },
                { key: 'pending', label: 'Active Orders', count: orders.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status)).length },
                { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Order Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ₹{order.total.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">Sold by: {item.seller}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ₹{item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Actions */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {order.estimatedDelivery && (
                      <p>Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                    )}
                    {order.trackingNumber && (
                      <p>Tracking: {order.trackingNumber}</p>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    {order.status === 'delivered' && (
                      <>
                        <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                          <Star className="h-4 w-4 mr-2" />
                          Rate & Review
                        </button>
                        <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                          <Download className="h-4 w-4 mr-2" />
                          Download Invoice
                        </button>
                      </>
                    )}
                    {['shipped', 'confirmed'].includes(order.status) && (
                      <button className="flex items-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100">
                        <Truck className="h-4 w-4 mr-2" />
                        Track Order
                      </button>
                    )}
                    <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Seller
                    </button>
                    <Link
                      to={`/order/${order.id}`}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <Link
            to="/marketplace"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100"
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Orders;
