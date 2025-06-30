const express = require('express');
const router = express.Router();
const { protect, optionalAuth, checkOwnership } = require('../middleware/auth');
const { 
  validateTalentProductCreation, 
  validatePagination, 
  validateObjectId 
} = require('../middleware/validation');
const { 
  uploadConfigs, 
  handleMulterError, 
  processUploadedFiles,
  validateFileRequirements 
} = require('../middleware/upload');
const TalentProduct = require('../models/TalentProduct');

// @route   GET /api/talent
// @desc    Get all talent products with filtering and pagination
// @access  Public
router.get('/', 
  optionalAuth,
  validatePagination,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 12,
        q,
        category,
        type,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        creator,
        featured
      } = req.query;

      // Build query
      const query = { isActive: true };

      // Text search
      if (q) {
        query.$text = { $search: q };
      }

      // Category filter
      if (category) {
        query.category = category;
      }

      // Type filter
      if (type) {
        query.type = type;
      }

      // Price range filter
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }

      // Creator filter
      if (creator) {
        query.creator = creator;
      }

      // Featured filter
      if (featured === 'true') {
        query.featured = true;
      }

      // Sort options
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [products, total] = await Promise.all([
        TalentProduct.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        TalentProduct.countDocuments(query)
      ]);

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalProducts: total,
            productsPerPage: parseInt(limit),
            hasNext: skip + parseInt(limit) < total,
            hasPrev: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      console.error('Get talent products error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching talent products'
      });
    }
  }
);

// @route   GET /api/talent/:id
// @desc    Get single talent product by ID
// @access  Public
router.get('/:id', 
  optionalAuth,
  validateObjectId(),
  async (req, res) => {
    try {
      const product = await TalentProduct.findById(req.params.id);

      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Talent product not found'
        });
      }

      // Increment views (but not for the owner)
      if (!req.user || req.user._id.toString() !== product.creator._id.toString()) {
        await product.incrementViews();
      }

      res.json({
        success: true,
        data: { product }
      });

    } catch (error) {
      console.error('Get talent product error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching talent product'
      });
    }
  }
);

// @route   POST /api/talent
// @desc    Create new talent product
// @access  Private
router.post('/',
  protect,
  uploadConfigs.talentFiles.array('files', 10),
  handleMulterError,
  processUploadedFiles('talent'),
  validateFileRequirements(true, 1, 10),
  validateTalentProductCreation,
  async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        category,
        subcategory,
        type,
        deliveryType,
        customDeliveryTime,
        tags,
        specifications,
        pricing,
        portfolio
      } = req.body;

      // Separate images and files
      const images = [];
      const files = [];

      req.uploadedFiles.forEach(file => {
        if (file.mimetype.startsWith('image/')) {
          images.push({
            url: file.url,
            alt: `${name} - Image`
          });
        } else {
          files.push({
            name: file.originalName,
            url: file.url,
            size: file.size,
            type: file.mimetype.includes('pdf') ? 'pdf' : 
                  file.mimetype.includes('doc') ? 'doc' :
                  file.mimetype.includes('zip') ? 'zip' : 'other'
          });
        }
      });

      // Create talent product
      const product = await TalentProduct.create({
        name,
        description,
        price: parseFloat(price),
        category,
        subcategory,
        type,
        deliveryType,
        customDeliveryTime,
        images,
        files,
        creator: req.user._id,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
        specifications: specifications ? JSON.parse(specifications) : {},
        pricing: pricing ? JSON.parse(pricing) : { basePrice: parseFloat(price) },
        portfolio: portfolio ? JSON.parse(portfolio) : []
      });

      res.status(201).json({
        success: true,
        message: 'Talent product created successfully',
        data: { product }
      });

    } catch (error) {
      console.error('Create talent product error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error creating talent product'
      });
    }
  }
);

// @route   PUT /api/talent/:id
// @desc    Update talent product
// @access  Private (Owner only)
router.put('/:id',
  protect,
  validateObjectId(),
  checkOwnership(TalentProduct),
  async (req, res) => {
    try {
      const allowedUpdates = [
        'name', 'description', 'price', 'subcategory', 'deliveryType',
        'customDeliveryTime', 'tags', 'specifications', 'pricing'
      ];

      const updates = {};
      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      // Parse numeric fields
      if (updates.price) updates.price = parseFloat(updates.price);

      // Parse tags if provided
      if (updates.tags) {
        updates.tags = Array.isArray(updates.tags) ? updates.tags : updates.tags.split(',').map(t => t.trim());
      }

      // Parse JSON fields
      if (updates.specifications && typeof updates.specifications === 'string') {
        updates.specifications = JSON.parse(updates.specifications);
      }
      if (updates.pricing && typeof updates.pricing === 'string') {
        updates.pricing = JSON.parse(updates.pricing);
      }

      const product = await TalentProduct.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Talent product updated successfully',
        data: { product }
      });

    } catch (error) {
      console.error('Update talent product error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating talent product'
      });
    }
  }
);

// @route   DELETE /api/talent/:id
// @desc    Delete talent product
// @access  Private (Owner only)
router.delete('/:id',
  protect,
  validateObjectId(),
  checkOwnership(TalentProduct),
  async (req, res) => {
    try {
      await TalentProduct.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Talent product deleted successfully'
      });

    } catch (error) {
      console.error('Delete talent product error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error deleting talent product'
      });
    }
  }
);

// @route   POST /api/talent/:id/review
// @desc    Add review to talent product
// @access  Private
router.post('/:id/review',
  protect,
  validateObjectId(),
  async (req, res) => {
    try {
      const { rating, comment } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      const product = await TalentProduct.findById(req.params.id);

      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Talent product not found'
        });
      }

      // Check if user is the creator
      if (product.creator._id.toString() === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'You cannot review your own product'
        });
      }

      await product.addReview(req.user._id, parseInt(rating), comment);

      res.json({
        success: true,
        message: 'Review added successfully',
        data: {
          averageRating: product.averageRating,
          totalReviews: product.stats.totalReviews
        }
      });

    } catch (error) {
      console.error('Add review error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error adding review'
      });
    }
  }
);

// @route   GET /api/talent/categories
// @desc    Get talent product categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await TalentProduct.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('Get talent categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching categories'
    });
  }
});

module.exports = router;
