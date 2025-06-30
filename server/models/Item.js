const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    max: [1000000, 'Price cannot exceed 10 lakhs']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative'],
    validate: {
      validator: function(value) {
        return !value || value >= this.price;
      },
      message: 'Original price should be greater than or equal to selling price'
    }
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [50, 'Subcategory cannot exceed 50 characters']
  },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
    required: [true, 'Condition is required']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String, // For Cloudinary
    alt: String
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required']
  },
  location: {
    hostel: {
      type: String,
      trim: true,
      maxlength: [50, 'Hostel name cannot exceed 50 characters']
    },
    room: {
      type: String,
      trim: true,
      maxlength: [20, 'Room number cannot exceed 20 characters']
    },
    campus: {
      type: String,
      default: 'LPU Main Campus',
      trim: true
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  specifications: {
    brand: {
      type: String,
      trim: true,
      maxlength: [50, 'Brand cannot exceed 50 characters']
    },
    model: {
      type: String,
      trim: true,
      maxlength: [50, 'Model cannot exceed 50 characters']
    },
    year: {
      type: Number,
      min: [1900, 'Year cannot be before 1900'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
    },
    color: {
      type: String,
      trim: true,
      maxlength: [30, 'Color cannot exceed 30 characters']
    },
    size: {
      type: String,
      trim: true,
      maxlength: [20, 'Size cannot exceed 20 characters']
    }
  },
  availability: {
    status: {
      type: String,
      enum: ['available', 'sold', 'reserved', 'inactive'],
      default: 'available'
    },
    reservedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reservedUntil: Date
  },
  negotiable: {
    type: Boolean,
    default: true
  },
  urgent: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'fake', 'sold', 'other'],
      required: true
    },
    description: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  featured: {
    type: Boolean,
    default: false
  },
  featuredUntil: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
itemSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for days since posted
itemSchema.virtual('daysSincePosted').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Indexes for better query performance
itemSchema.index({ seller: 1, createdAt: -1 });
itemSchema.index({ category: 1, 'availability.status': 1 });
itemSchema.index({ price: 1 });
itemSchema.index({ createdAt: -1 });
itemSchema.index({ tags: 1 });
itemSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Middleware to populate seller info
itemSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'seller',
    select: 'name avatar university program year hostel whatsapp upiId stats.rating'
  }).populate({
    path: 'category',
    select: 'name icon'
  });
  next();
});

// Method to increment views
itemSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Method to toggle like
itemSchema.methods.toggleLike = function(userId) {
  const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
  
  if (existingLike) {
    this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  } else {
    this.likes.push({ user: userId });
  }
  
  return this.save();
};

// Method to check if user has liked
itemSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

module.exports = mongoose.model('Item', itemSchema);
