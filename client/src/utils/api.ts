import axios, { AxiosResponse, AxiosError } from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: any) => api.post('/auth/change-password', data),
  verifyToken: () => api.get('/auth/verify-token'),
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

export default api;
