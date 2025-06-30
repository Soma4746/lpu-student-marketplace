import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Upload } from 'lucide-react';
import { paymentsAPI, ordersAPI } from '../utils/api';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    _id: string;
    amount: number;
    seller: {
      name: string;
      email: string;
    };
    item?: {
      title: string;
    };
    talentProduct?: {
      name: string;
    };
  };
  onPaymentSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  order,
  onPaymentSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi'>('razorpay');
  const [loading, setLoading] = useState(false);
  const [upiDetails, setUpiDetails] = useState({
    transactionId: '',
    screenshot: null as File | null
  });

  if (!isOpen) return null;

  const handleRazorpayPayment = async () => {
    try {
      setLoading(true);

      // Create Razorpay order
      const orderResponse = await paymentsAPI.createRazorpayOrder(order._id, order.amount);
      const { razorpayOrderId, amount, currency, key } = orderResponse.data.data;

      // Initialize Razorpay
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'LPU Student Marketplace',
        description: `Payment for ${order.item?.title || order.talentProduct?.name}`,
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            await paymentsAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id
            });

            toast.success('Payment successful!');
            onPaymentSuccess();
            onClose();
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: 'Student',
          email: 'student@lpu.co.in'
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error('Failed to initialize payment');
      setLoading(false);
    }
  };

  const handleUPIPayment = async () => {
    if (!upiDetails.transactionId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }

    try {
      setLoading(true);

      // Upload UPI payment details
      await paymentsAPI.uploadUPIPayment(
        order._id,
        upiDetails.transactionId,
        upiDetails.screenshot ? 'screenshot_uploaded' : undefined
      );

      toast.success('UPI payment details uploaded successfully!');
      onPaymentSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to upload payment details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size should be less than 5MB');
        return;
      }
      setUpiDetails(prev => ({ ...prev, screenshot: file }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Complete Payment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Item:</span>
                <span className="font-medium">
                  {order.item?.title || order.talentProduct?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Seller:</span>
                <span>{order.seller.name}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span className="text-blue-600">₹{order.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Choose Payment Method</h3>
            <div className="space-y-3">
              {/* Razorpay Option */}
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'razorpay')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <CreditCard className="h-5 w-5 text-gray-600 ml-3 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">
                    Card/UPI/Netbanking
                  </div>
                  <div className="text-sm text-gray-600">
                    Pay securely with Razorpay
                  </div>
                </div>
              </label>

              {/* UPI Option */}
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'upi')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <Smartphone className="h-5 w-5 text-gray-600 ml-3 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">
                    Direct UPI Transfer
                  </div>
                  <div className="text-sm text-gray-600">
                    Pay directly and upload proof
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* UPI Payment Details */}
          {paymentMethod === 'upi' && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">UPI Payment Details</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UPI ID
                  </label>
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <code className="text-sm font-mono text-blue-600">
                      seller@upi
                    </code>
                    <p className="text-xs text-gray-600 mt-1">
                      Send ₹{order.amount.toLocaleString()} to this UPI ID
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction ID *
                  </label>
                  <input
                    type="text"
                    value={upiDetails.transactionId}
                    onChange={(e) => setUpiDetails(prev => ({ ...prev, transactionId: e.target.value }))}
                    placeholder="Enter UPI transaction ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Screenshot (Optional)
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    {upiDetails.screenshot && (
                      <span className="text-sm text-green-600">
                        ✓ {upiDetails.screenshot.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={paymentMethod === 'razorpay' ? handleRazorpayPayment : handleUPIPayment}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              `Pay ₹${order.amount.toLocaleString()}`
            )}
          </button>

          <p className="text-xs text-gray-600 text-center mt-4">
            Your payment is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
