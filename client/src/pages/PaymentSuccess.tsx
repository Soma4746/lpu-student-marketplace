import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Download, 
  Share2, 
  Package,
  Clock,
  Shield,
  ArrowRight,
  Home,
  ShoppingBag
} from 'lucide-react';

interface PaymentData {
  payment: {
    paymentId: string;
    orderId: string;
    totalAmount: number;
    platformCommission: number;
    sellerAmount: number;
    status: string;
    gateway: string;
    createdAt: string;
  };
  receipt: {
    receiptId: string;
    paymentId: string;
    amount: number;
    commission: number;
    sellerAmount: number;
    transactionId: string;
    timestamp: string;
  };
}

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const paymentData = location.state as PaymentData;

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="text-red-500 mb-4">
              <Package className="h-24 w-24 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment data not found</h2>
            <p className="text-gray-600 mb-8">
              Unable to retrieve payment information. Please check your orders.
            </p>
            <Link
              to="/orders"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { payment, receipt } = paymentData;

  const downloadReceipt = () => {
    // Create receipt content
    const receiptContent = `
LPU STUDENT MARKETPLACE
Payment Receipt

Receipt ID: ${receipt.receiptId}
Payment ID: ${receipt.paymentId}
Transaction ID: ${receipt.transactionId}
Date: ${new Date(receipt.timestamp).toLocaleString()}

Amount Paid: ₹${receipt.amount.toLocaleString()}
Platform Fee: ₹${receipt.commission.toLocaleString()}
Seller Amount: ₹${receipt.sellerAmount.toLocaleString()}

Status: Payment Successful
Gateway: ${payment.gateway.toUpperCase()}

Thank you for shopping with LPU Student Marketplace!
    `;

    // Create and download file
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${receipt.receiptId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const sharePayment = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Payment Successful - LPU Marketplace',
        text: `Successfully paid ₹${receipt.amount.toLocaleString()} on LPU Student Marketplace`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `Payment successful! Paid ₹${receipt.amount.toLocaleString()} on LPU Student Marketplace. Transaction ID: ${receipt.transactionId}`
      );
      alert('Payment details copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600">
            Your order has been confirmed and payment processed successfully
          </p>
        </div>

        {/* Payment Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment ID</label>
                  <p className="text-lg font-mono text-gray-900">{payment.paymentId}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                  <p className="text-lg font-mono text-gray-900">{receipt.transactionId}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Method</label>
                  <p className="text-lg text-gray-900 capitalize">{payment.gateway}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Date & Time</label>
                  <p className="text-lg text-gray-900">
                    {new Date(payment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Amount</label>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{payment.totalAmount.toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Payment Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-800">Platform Fee ({((payment.platformCommission / payment.totalAmount) * 100).toFixed(1)}%)</span>
                      <span className="text-blue-900 font-medium">₹{payment.platformCommission.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Seller Amount</span>
                      <span className="text-blue-900 font-medium">₹{payment.sellerAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-green-600">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">Payment Secured in Escrow</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">What happens next?</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">1</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Order Confirmation</h3>
                  <p className="text-sm text-gray-600">
                    Your order has been confirmed and the seller has been notified.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-yellow-600">2</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Seller Preparation</h3>
                  <p className="text-sm text-gray-600">
                    The seller will prepare your items and arrange for delivery.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-purple-600">3</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Delivery & Payment Release</h3>
                  <p className="text-sm text-gray-600">
                    Once you confirm delivery, the payment will be released to the seller.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={downloadReceipt}
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Receipt
          </button>
          
          <button
            onClick={sharePayment}
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Share Payment
          </button>
          
          <Link
            to="/orders"
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Package className="h-5 w-5 mr-2" />
            Track Order
          </Link>
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 text-base font-medium text-primary-600 hover:text-primary-700"
            >
              <Home className="h-5 w-5 mr-2" />
              Go to Home
            </Link>
            
            <Link
              to="/marketplace"
              className="inline-flex items-center px-6 py-3 text-base font-medium text-primary-600 hover:text-primary-700"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Continue Shopping
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-green-900">Secure Transaction</h3>
              <p className="text-sm text-green-800 mt-1">
                Your payment is protected by industry-standard encryption and held securely in escrow 
                until delivery confirmation. You can raise a dispute if there are any issues.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
