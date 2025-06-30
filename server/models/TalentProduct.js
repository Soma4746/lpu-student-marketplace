const mongoose = require('mongoose');

const talentProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    max: [100000, 'Price cannot exceed 1 lakh']
  },
  category: {
    type: String,
    enum: ['Art', 'Craft', 'Code', 'Design', 'Writing', 'Music', 'Photography', 'Video', 'Tutoring', 'Other'],
    required: [true, 'Category is required']
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [50, 'Subcategory cannot exceed 50 characters']
  },
  type: {
    type: String,
    enum: ['physical', 'digital', 'service'],
    required: [true, 'Product type is required']
  },
  deliveryType: {
    type: String,
    enum: ['instant', 'within_24h', '1-3_days', '3-7_days', 'custom'],
    required: [true, 'Delivery type is required']
  },
  customDeliveryTime: {
    type: String,
    trim: true,
    maxlength: [100, 'Custom delivery time cannot exceed 100 characters']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String, // For Cloudinary
    alt: String,
    isPreview: {
      type: Boolean,
      default: false
    }
  }],
  files: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    publicId: String,
    size: Number, // in bytes
    type: {
      type: String,
      enum: ['pdf', 'doc', 'image', 'video', 'audio', 'zip', 'other']
    },
    isPreview: {
      type: Boolean,
      default: false
    }
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  specifications: {
    dimensions: String, // For physical products
    format: String, // For digital products
    duration: String, // For services/videos
    language: String,
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels']
    },
    tools: [String], // Software/tools used
    includes: [String] // What's included in the package
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    packages: [{
      name: {
        type: String,
        required: true
      },
      description: String,
      price: {
        type: Number,
        required: true
      },
      deliveryTime: String,
      features: [String]
    }]
  },
  availability: {
    status: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available'
    },
    slots: {
      type: Number,
      default: null // null means unlimited
    },
    bookedSlots: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  stats: {
    views: {
      type: Number,
      default: 0
    },
    orders: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  featuredUntil: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  portfolio: [{
    title: String,
    description: String,
    image: String,
    url: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating calculation
talentProductSchema.virtual('averageRating').get(function() {
  if (this.reviews && this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
  }
  return 0;
});

// Virtual for days since created
talentProductSchema.virtual('daysSinceCreated').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for availability percentage
talentProductSchema.virtual('availabilityPercentage').get(function() {
  if (!this.availability.slots) return 100;
  return Math.max(0, ((this.availability.slots - this.availability.bookedSlots) / this.availability.slots) * 100);
});

// Indexes for better query performance
talentProductSchema.index({ creator: 1, createdAt: -1 });
talentProductSchema.index({ category: 1, type: 1 });
talentProductSchema.index({ price: 1 });
talentProductSchema.index({ 'stats.rating': -1 });
talentProductSchema.index({ createdAt: -1 });
talentProductSchema.index({ tags: 1 });
talentProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Middleware to populate creator info
talentProductSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'creator',
    select: 'name avatar bio university program year stats.rating socialLinks'
  });
  next();
});

// Method to increment views
talentProductSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Method to add review
talentProductSchema.methods.addReview = function(userId, rating, comment) {
  // Check if user already reviewed
  const existingReview = this.reviews.find(review => review.user.toString() === userId.toString());
  
  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = comment;
  } else {
    this.reviews.push({ user: userId, rating, comment });
  }
  
  // Update stats
  this.stats.totalReviews = this.reviews.length;
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.stats.rating = Math.round((totalRating / this.reviews.length) * 10) / 10;
  
  return this.save();
};

// Method to book a slot
talentProductSchema.methods.bookSlot = function() {
  if (this.availability.slots && this.availability.bookedSlots >= this.availability.slots) {
    throw new Error('No slots available');
  }
  
  this.availability.bookedSlots += 1;
  this.stats.orders += 1;
  
  return this.save();
};

module.exports = mongoose.model('TalentProduct', talentProductSchema);
