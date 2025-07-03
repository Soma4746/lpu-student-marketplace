import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Smartphone,
  Building,
  Wallet,
  ArrowLeft,
  Lock
} from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  seller: string;
}

const Checkout: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get cart items from location state or localStorage
  const [cartItems] = useState<CartItem[]>(
    location.state?.cartItems || JSON.parse(localStorage.getItem('cartItems') || '[]')
  );
  
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: state.user?.name || '',
    phone: state.user?.phone || '',
    address: '',
    city: 'Jalandhar',
    state: 'Punjab',
    pincode: '144411',
    landmark: ''
  });

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = 0; // Free delivery
  const platformFee = Math.round(subtotal * 0.02); // 2% platform fee
  const total = subtotal + deliveryFee + platformFee;

  // Commission calculation (3% of total)
  const commissionRate = 3;
  const platformCommission = Math.round(total * (commissionRate / 100));
  const sellerAmount = total - platformCommission;

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleAddressChange = (field: string, value: string) => {
    setDeliveryAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.address) {
      alert('Please fill in all required delivery details');
      return false;
    }
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return false;
    }
    return true;
  };

  const handleRazorpayPayment = async () => {
    try {
      setIsProcessing(true);

      // Create order on backend
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId: `ORDER_${Date.now()}`,
          amount: total
        })
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.message);
      }

      // Configure Razorpay options
      const options = {
        key: orderData.data.key,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'LPU Student Marketplace',
        description: `Payment for ${cartItems.length} items`,
        order_id: orderData.data.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                orderId: orderData.data.orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentMethod: 'card'
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              // Clear cart
              localStorage.removeItem('cartItems');
              
              // Redirect to success page
              navigate('/payment-success', {
                state: {
                  payment: verifyData.data.payment,
                  receipt: verifyData.data.receipt
                }
              });
            } else {
              throw new Error(verifyData.message);
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: deliveryAddress.fullName,
          email: state.user?.email,
          contact: deliveryAddress.phone
        },
        notes: {
          address: `${deliveryAddress.address}, ${deliveryAddress.city}`,
          items: cartItems.length.toString()
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleUPIPayment = () => {
    // For UPI, redirect to UPI payment page
    navigate('/upi-payment', {
      state: {
        cartItems,
        total,
        deliveryAddress,
        platformCommission,
        sellerAmount
      }
    });
  };

  const handlePayment = () => {
    if (!validateForm()) return;

    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
    } else {
      handleUPIPayment();
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <AlertCircle className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No items to checkout</h2>
            <p className="text-gray-600 mb-8">
              Your cart is empty. Add some items to proceed with checkout.
            </p>
            <button
              onClick={() => navigate('/marketplace')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Continue Shopping
            </button>
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
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">
            Review your order and complete your purchase
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-7">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.fullName}
                    onChange={(e) => handleAddressChange('fullName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={deliveryAddress.phone}
                    onChange={(e) => handleAddressChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  value={deliveryAddress.address}
                  onChange={(e) => handleAddressChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="House/Room number, Building, Street"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.pincode}
                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
              
              <div className="space-y-4">
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'razorpay'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('razorpay')}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="h-4 w-4 text-primary-600"
                    />
                    <div className="ml-3 flex items-center">
                      <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="font-medium">Card/UPI/NetBanking</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 ml-7">
                    Pay securely using Razorpay - Cards, UPI, NetBanking, Wallets
                  </p>
                </div>

                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'upi'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="h-4 w-4 text-primary-600"
                    />
                    <div className="ml-3 flex items-center">
                      <Smartphone className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="font-medium">Direct UPI Transfer</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 ml-7">
                    Pay directly to seller's UPI ID with payment proof
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee (2%)</span>
                  <span className="font-medium">₹{platformFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      ₹{total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Commission Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-900">Payment Protection</span>
                </div>
                <p className="text-xs text-blue-800">
                  Your payment is held securely until delivery confirmation. 
                  Platform commission: ₹{platformCommission} ({commissionRate}%)
                </p>
                <p className="text-xs text-blue-800 mt-1">
                  Seller receives: ₹{sellerAmount.toLocaleString()} after delivery
                </p>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className={`w-full mt-6 py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center space-x-2 ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                <Lock className="h-5 w-5" />
                <span>
                  {isProcessing ? 'Processing...' : `Pay ₹${total.toLocaleString()}`}
                </span>
              </button>

              {/* Security Info */}
              <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
                <Shield className="h-4 w-4 mr-1" />
                <span>Secured by 256-bit SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
