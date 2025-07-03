import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Share2,
  Eye,
  Star,
  ShoppingBag
} from 'lucide-react';

interface WishlistItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  seller: string;
  condition: string;
  rating: number;
  isAvailable: boolean;
  category: string;
}

const Wishlist: React.FC = () => {
  // Mock wishlist data
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: '1',
      title: 'MacBook Pro 13" M2 Chip',
      price: 85000,
      originalPrice: 95000,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
      seller: 'Tech Store LPU',
      condition: 'Like New',
      rating: 4.8,
      isAvailable: true,
      category: 'Electronics'
    },
    {
      id: '2',
      title: 'Calculus and Analytical Geometry',
      price: 1200,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300',
      seller: 'BookHub LPU',
      condition: 'Good',
      rating: 4.5,
      isAvailable: true,
      category: 'Books'
    },
    {
      id: '3',
      title: 'Gaming Chair - Ergonomic Design',
      price: 12000,
      originalPrice: 15000,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300',
      seller: 'Furniture Plus',
      condition: 'Excellent',
      rating: 4.7,
      isAvailable: false,
      category: 'Furniture'
    },
    {
      id: '4',
      title: 'Professional Camera - Canon EOS',
      price: 35000,
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300',
      seller: 'Photo Studio LPU',
      condition: 'Like New',
      rating: 4.9,
      isAvailable: true,
      category: 'Electronics'
    },
    {
      id: '5',
      title: 'Branded Backpack - Travel Series',
      price: 2500,
      originalPrice: 3500,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300',
      seller: 'Style Store',
      condition: 'Good',
      rating: 4.3,
      isAvailable: true,
      category: 'Accessories'
    }
  ]);

  const removeFromWishlist = (id: string) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  const addToCart = (id: string) => {
    // Implementation for adding to cart
    console.log('Added to cart:', id);
    // Show success message
  };

  const shareItem = (item: WishlistItem) => {
    // Implementation for sharing
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Check out this ${item.title} on LPU Marketplace`,
        url: window.location.href
      });
    }
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <Heart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">
              Save items you love to your wishlist. Review them anytime and easily move them to your cart.
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
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-2">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-t-lg flex items-center justify-center">
                    <span className="text-white font-semibold">Out of Stock</span>
                  </div>
                )}
                {item.originalPrice && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={() => shareItem(item)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                    title="Share"
                  >
                    <Share2 className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    {item.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.title}
                </h3>
                
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500 ml-2">• {item.condition}</span>
                </div>

                <p className="text-sm text-gray-600 mb-3">
                  by <span className="font-medium">{item.seller}</span>
                </p>

                {/* Price */}
                <div className="flex items-center mb-4">
                  <span className="text-xl font-bold text-gray-900">
                    ₹{item.price.toLocaleString()}
                  </span>
                  {item.originalPrice && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ₹{item.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => addToCart(item.id)}
                    disabled={!item.isAvailable}
                    className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.isAvailable
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {item.isAvailable ? 'Add to Cart' : 'Unavailable'}
                  </button>
                  
                  <Link
                    to={`/item/${item.id}`}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4 text-gray-600" />
                  </Link>
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

export default Wishlist;
