import axios, { AxiosResponse, AxiosError } from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 60000, // Increased to 60 seconds for Render cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug logging
console.log('API Base URL:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api');

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const message = (error.response?.data as any)?.message || error.message || 'Something went wrong';
    
    // Handle specific error codes
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('Access denied');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found');
    } else if (error.response?.status && error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  registerStudent: (data: any) => api.post('/auth/register/student', data),
  registerAdmin: (data: any) => api.post('/auth/register/admin', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: any) => api.post('/auth/change-password', data),
  verifyToken: () => api.get('/auth/verify-token'),
  // Admin endpoints
  get: (endpoint: string) => api.get(endpoint),
  put: (endpoint: string, data?: any) => api.put(endpoint, data),
  delete: (endpoint: string) => api.delete(endpoint),
};

export const itemsAPI = {
  getItems: (params?: any) => api.get('/items', { params }),
  getItem: (id: string) => api.get(`/items/${id}`),
  createItem: (data: FormData) => api.post('/items', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateItem: (id: string, data: any) => api.put(`/items/${id}`, data),
  deleteItem: (id: string) => api.delete(`/items/${id}`),
  likeItem: (id: string) => api.post(`/items/${id}/like`),
  reportItem: (id: string, data: any) => api.post(`/items/${id}/report`, data),
  updateStatus: (id: string, data: any) => api.put(`/items/${id}/status`, data),
};

export const talentAPI = {
  getProducts: (params?: any) => api.get('/talent', { params }),
  getProduct: (id: string) => api.get(`/talent/${id}`),
  createProduct: (data: FormData) => api.post('/talent', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProduct: (id: string, data: any) => api.put(`/talent/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/talent/${id}`),
  addReview: (id: string, data: any) => api.post(`/talent/${id}/review`, data),
  getCategories: () => api.get('/talent/categories'),
};

export const usersAPI = {
  getUsers: (params?: any) => api.get('/users', { params }),
  getUser: (id: string) => api.get(`/users/${id}`),
  getUserItems: (id: string, params?: any) => api.get(`/users/${id}/items`, { params }),
  getUserTalent: (id: string, params?: any) => api.get(`/users/${id}/talent`, { params }),
  uploadAvatar: (data: FormData) => api.post('/users/upload-avatar', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDashboard: () => api.get('/users/me/dashboard'),
};

export const categoriesAPI = {
  getCategories: (params?: any) => api.get('/categories', { params }),
  getCategory: (id: string) => api.get(`/categories/${id}`),
  getCategoryBySlug: (slug: string) => api.get(`/categories/slug/${slug}`),
  getPopular: (limit?: number) => api.get('/categories/popular', { params: { limit } }),
};

// Utility functions
export const uploadFile = async (file: File, type: 'avatar' | 'item' | 'talent' = 'item') => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await api.post(`/upload/${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await api.get(url, { responseType: 'blob' });
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    toast.error('Failed to download file');
    throw error;
  }
};

// Helper function to handle API responses
export const handleApiResponse = <T>(response: AxiosResponse<T>) => {
  const data = response.data as any;
  if (data?.success) {
    return data.data;
  }
  throw new Error(data?.message || 'API request failed');
};

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to validate file type
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

// Helper function to validate file size
export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

// ===== NEW API ENDPOINTS =====

// Orders API
export const ordersAPI = {
  // Create order
  createOrder: (orderData: any) => api.post('/orders', orderData),

  // Get user orders
  getOrders: (params?: any) => api.get('/orders', { params }),

  // Get single order
  getOrder: (orderId: string) => api.get(`/orders/${orderId}`),

  // Update order status
  updateOrderStatus: (orderId: string, status: string, metadata?: any) =>
    api.put(`/orders/${orderId}/status`, { status, metadata }),

  // Add message to order
  addOrderMessage: (orderId: string, message: string) =>
    api.post(`/orders/${orderId}/messages`, { message }),

  // Mark order messages as read
  markOrderMessagesRead: (orderId: string) =>
    api.put(`/orders/${orderId}/messages/read`),

  // Get order statistics
  getOrderStats: () => api.get('/orders/stats')
};

// Payments API
export const paymentsAPI = {
  // Create Razorpay order
  createRazorpayOrder: (orderId: string, amount: number) =>
    api.post('/payments/create-order', { orderId, amount }),

  // Verify payment
  verifyPayment: (paymentData: any) =>
    api.post('/payments/verify', paymentData),

  // Upload UPI payment proof
  uploadUPIPayment: (orderId: string, transactionId: string, screenshot?: string) =>
    api.post('/payments/upi-upload', { orderId, transactionId, screenshot }),

  // Get payment details
  getPaymentDetails: (orderId: string) =>
    api.get(`/payments/order/${orderId}`),

  // Process refund
  processRefund: (orderId: string, reason: string, amount?: number) =>
    api.post('/payments/refund', { orderId, reason, amount })
};

// Wishlist API
export const wishlistAPI = {
  // Get wishlist
  getWishlist: (params?: any) => api.get('/wishlist', { params }),

  // Add item to wishlist
  addItemToWishlist: (itemId: string) =>
    api.post(`/wishlist/items/${itemId}`),

  // Add talent to wishlist
  addTalentToWishlist: (productId: string) =>
    api.post(`/wishlist/talent/${productId}`),

  // Remove item from wishlist
  removeItemFromWishlist: (itemId: string) =>
    api.delete(`/wishlist/items/${itemId}`),

  // Remove talent from wishlist
  removeTalentFromWishlist: (productId: string) =>
    api.delete(`/wishlist/talent/${productId}`),

  // Clear wishlist
  clearWishlist: (type?: 'items' | 'talent') =>
    api.delete('/wishlist/clear', { params: { type } }),

  // Check if item is in wishlist
  checkWishlist: (type: 'items' | 'talent', id: string) =>
    api.get(`/wishlist/check/${type}/${id}`)
};

// Reviews API
export const reviewsAPI = {
  // Create review
  createReview: (reviewData: any) => api.post('/reviews', reviewData),

  // Get reviews
  getReviews: (params?: any) => api.get('/reviews', { params }),

  // Get single review
  getReview: (reviewId: string) => api.get(`/reviews/${reviewId}`),

  // Update review
  updateReview: (reviewId: string, reviewData: any) =>
    api.put(`/reviews/${reviewId}`, reviewData),

  // Delete review
  deleteReview: (reviewId: string) => api.delete(`/reviews/${reviewId}`),

  // Vote on review
  voteOnReview: (reviewId: string, helpful: boolean) =>
    api.post(`/reviews/${reviewId}/helpful`, { helpful }),

  // Add response to review
  addReviewResponse: (reviewId: string, comment: string) =>
    api.post(`/reviews/${reviewId}/response`, { comment }),

  // Get review statistics
  getReviewStats: (targetId: string, targetType: 'user' | 'item' | 'talent') =>
    api.get(`/reviews/stats/${targetId}/${targetType}`),

  // Check if user can review
  canReview: (orderId: string) => api.get(`/reviews/can-review/${orderId}`)
};

// Messages API
export const messagesAPI = {
  // Get conversations
  getConversations: (params?: any) =>
    api.get('/messages/conversations', { params }),

  // Create conversation
  createConversation: (conversationData: any) =>
    api.post('/messages/conversations', conversationData),

  // Get conversation details
  getConversation: (conversationId: string) =>
    api.get(`/messages/conversations/${conversationId}`),

  // Get messages in conversation
  getMessages: (conversationId: string, params?: any) =>
    api.get(`/messages/conversations/${conversationId}/messages`, { params }),

  // Send message
  sendMessage: (conversationId: string, messageData: any) =>
    api.post(`/messages/conversations/${conversationId}/messages`, messageData),

  // Mark message as read
  markMessageRead: (messageId: string) =>
    api.put(`/messages/${messageId}/read`),

  // Mark all messages in conversation as read
  markAllMessagesRead: (conversationId: string) =>
    api.put(`/messages/conversations/${conversationId}/read-all`),

  // Edit message
  editMessage: (messageId: string, content: string) =>
    api.put(`/messages/${messageId}`, { content }),

  // Delete message
  deleteMessage: (messageId: string) => api.delete(`/messages/${messageId}`),

  // Get unread count
  getUnreadCount: () => api.get('/messages/unread-count')
};

// Notifications API
export const notificationsAPI = {
  // Contact seller
  contactSeller: (contactData: any) =>
    api.post('/notifications/contact-seller', contactData),

  // Send welcome email
  sendWelcomeEmail: (userId: string) =>
    api.post('/notifications/welcome', { userId }),

  // Request password reset
  requestPasswordReset: (email: string) =>
    api.post('/notifications/password-reset', { email }),

  // Verify reset token
  verifyResetToken: (email: string, token: string) =>
    api.post('/notifications/verify-reset-token', { email, token }),

  // Reset password
  resetPassword: (email: string, token: string, newPassword: string) =>
    api.post('/notifications/reset-password', { email, token, newPassword }),

  // Send bulk email (admin only)
  sendBulkEmail: (emailData: any) =>
    api.post('/notifications/bulk-email', emailData)
};

// Analytics API
export const analyticsAPI = {
  // Get dashboard analytics (admin only)
  getDashboard: (period?: string) =>
    api.get('/analytics/dashboard', { params: { period } }),

  // Get user statistics
  getUserStats: (userId: string) =>
    api.get(`/analytics/user-stats/${userId}`),

  // Get popular items
  getPopularItems: (params?: any) =>
    api.get('/analytics/popular-items', { params })
};

export default api;
