import { toast } from 'react-hot-toast';

// Razorpay types
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Load Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Initialize Razorpay payment
export const initiateRazorpayPayment = async (
  orderData: {
    orderId: string;
    amount: number;
    currency?: string;
    description: string;
  },
  userDetails: {
    name: string;
    email: string;
    phone: string;
  },
  onSuccess: (response: RazorpayResponse) => void,
  onFailure?: (error: any) => void
): Promise<void> => {
  try {
    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        return;
      }
    }

    const options: RazorpayOptions = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID || '',
      amount: orderData.amount * 100, // Convert to paise
      currency: orderData.currency || 'INR',
      name: 'LPU Marketplace',
      description: orderData.description,
      order_id: orderData.orderId,
      handler: (response: RazorpayResponse) => {
        toast.success('Payment successful!');
        onSuccess(response);
      },
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.phone,
      },
      theme: {
        color: '#3B82F6', // Primary blue color
      },
      modal: {
        ondismiss: () => {
          toast.error('Payment cancelled');
          if (onFailure) {
            onFailure(new Error('Payment cancelled by user'));
          }
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error('Razorpay payment error:', error);
    toast.error('Failed to initiate payment');
    if (onFailure) {
      onFailure(error);
    }
  }
};

// UPI payment utilities
export const generateUPILink = (
  upiId: string,
  amount: number,
  name: string,
  description: string
): string => {
  const params = new URLSearchParams({
    pa: upiId, // Payee address (UPI ID)
    pn: name, // Payee name
    am: amount.toString(), // Amount
    tn: description, // Transaction note
    cu: 'INR', // Currency
  });

  return `upi://pay?${params.toString()}`;
};

// Open UPI payment app
export const openUPIPayment = (
  upiId: string,
  amount: number,
  payeeName: string,
  description: string
): void => {
  try {
    const upiLink = generateUPILink(upiId, amount, payeeName, description);
    
    // Try to open UPI app
    window.open(upiLink, '_blank');
    
    toast.success('UPI payment link opened. Complete the payment in your UPI app.');
  } catch (error) {
    console.error('UPI payment error:', error);
    toast.error('Failed to open UPI payment');
  }
};

// Generate QR code for UPI payment
export const generateUPIQRCode = async (
  upiId: string,
  amount: number,
  name: string,
  description: string
): Promise<string> => {
  try {
    const upiLink = generateUPILink(upiId, amount, name, description);
    
    // Use a QR code generation service (you can replace this with your preferred service)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
    
    return qrCodeUrl;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Payment verification utility
export const verifyPayment = async (
  paymentId: string,
  orderId: string,
  signature: string
): Promise<boolean> => {
  try {
    // This should be done on the server side for security
    // Here we're just returning true for demo purposes
    console.log('Verifying payment:', { paymentId, orderId, signature });
    
    // In a real implementation, you would call your backend API
    // const response = await api.post('/payments/verify', {
    //   razorpay_payment_id: paymentId,
    //   razorpay_order_id: orderId,
    //   razorpay_signature: signature
    // });
    
    return true;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
};

// Format currency for display
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Payment method types
export type PaymentMethod = 'razorpay' | 'upi' | 'cash';

export interface PaymentData {
  method: PaymentMethod;
  amount: number;
  description: string;
  orderId?: string;
  upiId?: string;
  payeeName?: string;
}

// Main payment handler
export const processPayment = async (
  paymentData: PaymentData,
  userDetails: {
    name: string;
    email: string;
    phone: string;
  },
  onSuccess: (response: any) => void,
  onFailure?: (error: any) => void
): Promise<void> => {
  try {
    switch (paymentData.method) {
      case 'razorpay':
        if (!paymentData.orderId) {
          throw new Error('Order ID is required for Razorpay payment');
        }
        await initiateRazorpayPayment(
          {
            orderId: paymentData.orderId,
            amount: paymentData.amount,
            description: paymentData.description,
          },
          userDetails,
          onSuccess,
          onFailure
        );
        break;

      case 'upi':
        if (!paymentData.upiId || !paymentData.payeeName) {
          throw new Error('UPI ID and payee name are required for UPI payment');
        }
        openUPIPayment(
          paymentData.upiId,
          paymentData.amount,
          paymentData.payeeName,
          paymentData.description
        );
        // For UPI, we can't automatically detect success, so we call onSuccess immediately
        // In a real app, you might want to show a confirmation dialog
        setTimeout(() => {
          onSuccess({ method: 'upi', status: 'initiated' });
        }, 1000);
        break;

      case 'cash':
        // For cash payments, just mark as initiated
        toast.success('Cash payment selected. Please arrange for cash exchange.');
        onSuccess({ method: 'cash', status: 'arranged' });
        break;

      default:
        throw new Error('Unsupported payment method');
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    toast.error('Failed to process payment');
    if (onFailure) {
      onFailure(error);
    }
  }
};
