const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  university: {
    type: String,
    default: 'Lovely Professional University',
    trim: true
  },
  program: {
    type: String,
    trim: true,
    maxlength: [100, 'Program name cannot exceed 100 characters']
  },
  year: {
    type: String,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Other'],
    default: '1st Year'
  },
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
  whatsapp: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit WhatsApp number']
  },
  upiId: {
    type: String,
    trim: true,
    maxlength: [100, 'UPI ID cannot exceed 100 characters']
  },
  socialLinks: {
    instagram: {
      type: String,
      trim: true,
      maxlength: [100, 'Instagram handle cannot exceed 100 characters']
    },
    linkedin: {
      type: String,
      trim: true,
      maxlength: [200, 'LinkedIn URL cannot exceed 200 characters']
    },
    github: {
      type: String,
      trim: true,
      maxlength: [100, 'GitHub username cannot exceed 100 characters']
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    privacy: {
      showPhone: { type: Boolean, default: false },
      showEmail: { type: Boolean, default: true },
      showLocation: { type: Boolean, default: true }
    }
  },
  stats: {
    itemsSold: { type: Number, default: 0 },
    itemsBought: { type: Number, default: 0 },
    talentProductsSold: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 }
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user's items
userSchema.virtual('items', {
  ref: 'Item',
  localField: '_id',
  foreignField: 'seller'
});

// Virtual for user's talent products
userSchema.virtual('talentProducts', {
  ref: 'TalentProduct',
  localField: '_id',
  foreignField: 'creator'
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ name: 1 });
userSchema.index({ university: 1, program: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last active timestamp
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save({ validateBeforeSave: false });
};

// Get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  delete user.password;
  delete user.email;
  delete user.phone;
  delete user.preferences;
  return user;
};

module.exports = mongoose.model('User', userSchema);
