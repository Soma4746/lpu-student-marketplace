const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  icon: {
    type: String,
    trim: true,
    default: 'package' // Default Lucide icon name
  },
  color: {
    type: String,
    trim: true,
    default: '#3B82F6', // Default blue color
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color']
  },
  image: {
    url: String,
    publicId: String,
    alt: String
  },
  subcategories: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Subcategory name cannot exceed 50 characters']
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    description: String,
    icon: String
  }],
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0, // 0 for main categories, 1 for subcategories, etc.
    min: 0,
    max: 3
  },
  order: {
    type: Number,
    default: 0 // For sorting categories
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  stats: {
    itemCount: {
      type: Number,
      default: 0
    },
    talentProductCount: {
      type: Number,
      default: 0
    }
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for children categories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Virtual for items in this category
categorySchema.virtual('items', {
  ref: 'Item',
  localField: '_id',
  foreignField: 'category'
});

// Virtual for talent products in this category (for talent categories)
categorySchema.virtual('talentProducts', {
  ref: 'TalentProduct',
  localField: 'name',
  foreignField: 'category'
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1, order: 1 });
categorySchema.index({ isActive: 1, isFeatured: -1 });
categorySchema.index({ name: 'text', description: 'text' });

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Method to get full category path
categorySchema.methods.getPath = async function() {
  const path = [this];
  let current = this;
  
  while (current.parent) {
    current = await this.constructor.findById(current.parent);
    if (current) {
      path.unshift(current);
    } else {
      break;
    }
  }
  
  return path;
};

// Static method to get category tree
categorySchema.statics.getTree = async function() {
  const categories = await this.find({ isActive: true }).sort({ order: 1, name: 1 });
  
  const buildTree = (parentId = null) => {
    return categories
      .filter(cat => {
        if (parentId === null) return !cat.parent;
        return cat.parent && cat.parent.toString() === parentId.toString();
      })
      .map(cat => ({
        ...cat.toObject(),
        children: buildTree(cat._id)
      }));
  };
  
  return buildTree();
};

// Static method to get popular categories
categorySchema.statics.getPopular = async function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ 'stats.itemCount': -1, 'stats.talentProductCount': -1 })
    .limit(limit);
};

// Method to update item count
categorySchema.methods.updateItemCount = async function() {
  const Item = mongoose.model('Item');
  this.stats.itemCount = await Item.countDocuments({ 
    category: this._id, 
    'availability.status': 'available',
    isActive: true 
  });
  return this.save();
};

// Method to update talent product count
categorySchema.methods.updateTalentProductCount = async function() {
  const TalentProduct = mongoose.model('TalentProduct');
  this.stats.talentProductCount = await TalentProduct.countDocuments({ 
    category: this.name,
    isActive: true 
  });
  return this.save();
};

module.exports = mongoose.model('Category', categorySchema);
