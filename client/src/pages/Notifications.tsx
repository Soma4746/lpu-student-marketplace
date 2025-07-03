import React, { useState } from 'react';
import { 
  Bell, 
  Package, 
  ShoppingCart, 
  Heart,
  Star,
  MessageCircle,
  Gift,
  TrendingUp,
  Check,
  X,
  Clock,
  AlertCircle
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'order' | 'payment' | 'wishlist' | 'review' | 'message' | 'promotion' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  icon: React.ReactNode;
  priority: 'low' | 'medium' | 'high';
}

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  
  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'Order Delivered',
      message: 'Your order #LPU-2024-001 has been delivered successfully. Please confirm delivery to release payment to seller.',
      timestamp: '2024-01-25T10:30:00Z',
      read: false,
      actionUrl: '/orders/1',
      icon: <Package className="h-5 w-5 text-green-600" />,
      priority: 'high'
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Successful',
      message: 'Your payment of ₹15,000 for Wireless Headphones has been processed successfully.',
      timestamp: '2024-01-24T15:45:00Z',
      read: false,
      actionUrl: '/orders/2',
      icon: <ShoppingCart className="h-5 w-5 text-blue-600" />,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'wishlist',
      title: 'Price Drop Alert',
      message: 'MacBook Pro 13" in your wishlist is now available at ₹85,000 (₹10,000 off)!',
      timestamp: '2024-01-24T09:15:00Z',
      read: true,
      actionUrl: '/wishlist',
      icon: <Heart className="h-5 w-5 text-red-600" />,
      priority: 'medium'
    },
    {
      id: '4',
      type: 'review',
      title: 'Review Request',
      message: 'How was your experience with iPhone 13? Share your review and help other students.',
      timestamp: '2024-01-23T18:20:00Z',
      read: true,
      actionUrl: '/orders/1/review',
      icon: <Star className="h-5 w-5 text-yellow-600" />,
      priority: 'low'
    },
    {
      id: '5',
      type: 'message',
      title: 'New Message',
      message: 'Rahul Sharma sent you a message about iPhone 13 condition details.',
      timestamp: '2024-01-23T14:30:00Z',
      read: false,
      actionUrl: '/messages/1',
      icon: <MessageCircle className="h-5 w-5 text-purple-600" />,
      priority: 'high'
    },
    {
      id: '6',
      type: 'promotion',
      title: 'Special Offer',
      message: 'Get 20% off on all electronics this weekend! Use code WEEKEND20.',
      timestamp: '2024-01-22T12:00:00Z',
      read: true,
      actionUrl: '/marketplace?category=electronics',
      icon: <Gift className="h-5 w-5 text-orange-600" />,
      priority: 'low'
    },
    {
      id: '7',
      type: 'system',
      title: 'Account Security',
      message: 'Your account was accessed from a new device. If this wasn\'t you, please secure your account.',
      timestamp: '2024-01-21T20:45:00Z',
      read: true,
      actionUrl: '/profile/security',
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      priority: 'high'
    }
  ]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const filteredNotifications = notifications.filter(notif => 
    activeTab === 'all' || (activeTab === 'unread' && !notif.read)
  );

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-2">
                Stay updated with your orders, messages, and marketplace activity
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Notifications ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'unread'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </nav>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
            </h2>
            <p className="text-gray-600">
              {activeTab === 'unread' 
                ? 'You\'re all caught up! Check back later for new updates.'
                : 'You don\'t have any notifications yet. Start shopping to get updates!'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {notification.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-3">
                          <span className="text-sm text-gray-500 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {getTimeAgo(notification.timestamp)}
                          </span>
                          
                          {notification.actionUrl && (
                            <a
                              href={notification.actionUrl}
                              className="text-sm font-medium text-primary-600 hover:text-primary-700"
                            >
                              View Details →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 text-gray-400 hover:text-green-600"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Delete notification"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button (if needed) */}
        {filteredNotifications.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50">
              Load More Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
