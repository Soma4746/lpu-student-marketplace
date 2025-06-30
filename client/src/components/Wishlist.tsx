import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart, Eye } from 'lucide-react';
import { wishlistAPI } from '../utils/api';
import toast from 'react-hot-toast';

interface WishlistItem {
  _id: string;
  title?: string;
  name?: string;
  price: number;
  images: string[];
  category: string;
  seller?: {
    name: string;
    avatar?: string;
  };
  creator?: {
    name: string;
    avatar?: string;
  };
  wishlistType: 'item' | 'talent';
}

const Wishlist: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'items' | 'talent'>('all');

  useEffect(() => {
    fetchWishlist();
  }, [filter]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { type: filter } : {};
      const response = await wishlistAPI.getWishlist(params);
      setWishlistItems(response.data.data.wishlist);
    } catch (error) {
      toast.error('Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (item: WishlistItem) => {
    try {
      if (item.wishlistType === 'item') {
        await wishlistAPI.removeItemFromWishlist(item._id);
      } else {
        await wishlistAPI.removeTalentFromWishlist(item._id);
      }
      
      setWishlistItems(prev => prev.filter(i => i._id !== item._id));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const clearWishlist = async () => {
    try {
      const type = filter === 'all' ? undefined : filter;
      await wishlistAPI.clearWishlist(type);
      setWishlistItems([]);
      toast.success('Wishlist cleared');
    } catch (error) {
      toast.error('Failed to clear wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Heart className="h-8 w-8 text-red-500 mr-3" />
              My Wishlist
            </h1>
            <p className="text-gray-600 mt-2">
              {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          
          {wishlistItems.length > 0 && (
            <button
              onClick={clearWishlist}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { key: 'all', label: 'All Items' },
            { key: 'items', label: 'Marketplace' },
            { key: 'talent', label: 'Talent Store' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-600 mb-6">
              Start adding items you love to your wishlist
            </p>
            <a
              href="/marketplace"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Browse Marketplace
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.title || item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Eye className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Wishlist Type Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.wishlistType === 'item' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {item.wishlistType === 'item' ? 'Marketplace' : 'Talent'}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(item)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  >
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.title || item.name}
                  </h3>
                  
                  <p className="text-2xl font-bold text-blue-600 mb-2">
                    ₹{item.price.toLocaleString()}
                  </p>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {item.category}
                  </p>

                  {/* Seller/Creator Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">
                        {item.seller?.name || item.creator?.name}
                      </span>
                    </div>
                    
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Details
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

export default Wishlist;
