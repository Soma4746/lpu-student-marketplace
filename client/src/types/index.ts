// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  university: string;
  program?: string;
  year: string;
  hostel?: string;
  room?: string;
  whatsapp?: string;
  upiId?: string;
  socialLinks: {
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
  role: 'user' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
    };
    privacy: {
      showPhone: boolean;
      showEmail: boolean;
      showLocation: boolean;
    };
  };
  stats: {
    itemsSold: number;
    itemsBought: number;
    talentProductsSold: number;
    rating: number;
    totalRatings: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Item types
export interface Item {
  _id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: Category;
  subcategory?: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';
  images: {
    url: string;
    alt?: string;
  }[];
  seller: User;
  location: {
    hostel?: string;
    room?: string;
    campus: string;
  };
  tags: string[];
  specifications: {
    brand?: string;
    model?: string;
    year?: number;
    color?: string;
    size?: string;
  };
  availability: {
    status: 'available' | 'sold' | 'reserved' | 'inactive';
    reservedBy?: string;
    reservedUntil?: string;
  };
  negotiable: boolean;
  urgent: boolean;
  views: number;
  likes: {
    user: string;
    createdAt: string;
  }[];
  reports: {
    user: string;
    reason: string;
    description?: string;
    createdAt: string;
  }[];
  featured: boolean;
  featuredUntil?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
  likeCount?: number;
  daysSincePosted?: number;
}

// Talent Product types
export interface TalentProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'Art' | 'Craft' | 'Code' | 'Design' | 'Writing' | 'Music' | 'Photography' | 'Video' | 'Tutoring' | 'Other';
  subcategory?: string;
  type: 'physical' | 'digital' | 'service';
  deliveryType: 'instant' | 'within_24h' | '1-3_days' | '3-7_days' | 'custom';
  customDeliveryTime?: string;
  images: {
    url: string;
    alt?: string;
    isPreview?: boolean;
  }[];
  files: {
    name: string;
    url: string;
    size: number;
    type: 'pdf' | 'doc' | 'image' | 'video' | 'audio' | 'zip' | 'other';
    isPreview?: boolean;
  }[];
  creator: User;
  tags: string[];
  specifications: {
    dimensions?: string;
    format?: string;
    duration?: string;
    language?: string;
    level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
    tools?: string[];
    includes?: string[];
  };
  pricing: {
    basePrice: number;
    packages?: {
      name: string;
      description?: string;
      price: number;
      deliveryTime?: string;
      features: string[];
    }[];
  };
  availability: {
    status: 'available' | 'busy' | 'unavailable';
    slots?: number;
    bookedSlots: number;
  };
  reviews: {
    user: string;
    rating: number;
    comment?: string;
    createdAt: string;
  }[];
  stats: {
    views: number;
    orders: number;
    rating: number;
    totalReviews: number;
  };
  featured: boolean;
  featuredUntil?: string;
  isActive: boolean;
  portfolio: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
  daysSinceCreated?: number;
  availabilityPercentage?: number;
}

// Category types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  color: string;
  image?: {
    url: string;
    alt?: string;
  };
  subcategories: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
  }[];
  parent?: string;
  level: number;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  stats: {
    itemCount: number;
    talentProductCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Order types
export interface Order {
  _id: string;
  orderId: string;
  buyer: User;
  seller: User;
  item?: Item;
  talentProduct?: TalentProduct;
  type: 'item' | 'talent';
  amount: number;
  paymentMethod: 'razorpay' | 'upi' | 'cash' | 'other';
  paymentDetails: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    upiTransactionId?: string;
    screenshot?: string;
  };
  status: 'pending' | 'paid' | 'delivered' | 'completed' | 'cancelled' | 'refunded';
  deliveryInfo: {
    type?: 'pickup' | 'delivery' | 'digital' | 'service';
    address?: string;
    phone?: string;
    instructions?: string;
    estimatedDelivery?: string;
    actualDelivery?: string;
  };
  communication: {
    from: string;
    message: string;
    timestamp: string;
    isRead: boolean;
  }[];
  rating: {
    buyerRating?: {
      rating: number;
      comment?: string;
      createdAt: string;
    };
    sellerRating?: {
      rating: number;
      comment?: string;
      createdAt: string;
    };
  };
  metadata: {
    packageSelected?: string;
    customRequirements?: string;
    files?: string[];
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginationResponse<T> {
  success: boolean;
  data: {
    items?: T[];
    products?: T[];
    users?: T[];
    categories?: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems?: number;
      totalProducts?: number;
      totalUsers?: number;
      itemsPerPage?: number;
      productsPerPage?: number;
      usersPerPage?: number;
      hasNext?: boolean;
      hasPrev?: boolean;
    };
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  phone?: string;
  program?: string;
  year?: string;
  hostel?: string;
  room?: string;
  whatsapp?: string;
  bio?: string;
}

export interface ItemForm {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  condition: string;
  tags?: string[];
  specifications?: any;
  negotiable?: boolean;
  urgent?: boolean;
  images: File[];
}

export interface TalentProductForm {
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  type: string;
  deliveryType: string;
  customDeliveryTime?: string;
  tags?: string[];
  specifications?: any;
  pricing?: any;
  portfolio?: any[];
  files: File[];
}

// Search and Filter types
export interface SearchFilters {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Dashboard types
export interface DashboardStats {
  stats: {
    activeItems: number;
    soldItems: number;
    talentProducts: number;
    totalViews: number;
    totalLikes: number;
  };
  recentItems: Item[];
  recentBuyerOrders: Order[];
  recentSellerOrders: Order[];
}
