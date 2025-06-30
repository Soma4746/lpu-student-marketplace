const express = require('express');
const router = express.Router();
const { protect, optionalAuth, checkOwnership } = require('../middleware/auth');
const { 
  validateItemCreation, 
  validatePagination, 
  validateSearch,
  validateObjectId 
} = require('../middleware/validation');
const { 
  uploadConfigs, 
  handleMulterError, 
  processUploadedFiles,
  validateFileRequirements 
} = require('../middleware/upload');
const Item = require('../models/Item');
const Category = require('../models/Category');

// @route   GET /api/items
// @desc    Get all items with filtering and pagination
// @access  Public
router.get('/', 
  optionalAuth,
  validatePagination,
  validateSearch,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 12,
        q,
        category,
        minPrice,
        maxPrice,
        condition,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        seller,
        featured
      } = req.query;

      // Build query
      const query = {
        isActive: true,
        'availability.status': 'available'
      };

      // Text search
      if (q) {
        query.$text = { $search: q };
      }

      // Category filter
      if (category) {
        query.category = category;
      }

      // Price range filter
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }

      // Condition filter
      if (condition) {
        query.condition = condition;
      }

      // Seller filter
      if (seller) {
        query.seller = seller;
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
      
      const [items, total] = await Promise.all([
        Item.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Item.countDocuments(query)
      ]);

      // Add user-specific data if authenticated
      if (req.user) {
        items.forEach(item => {
          item.isLiked = item.likes.some(like => 
            like.user.toString() === req.user._id.toString()
          );
        });
      }

      res.json({
        success: true,
        data: {
          items,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            itemsPerPage: parseInt(limit),
            hasNext: skip + parseInt(limit) < total,
            hasPrev: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      console.error('Get items error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching items'
      });
    }
  }
);

// @route   GET /api/items/:id
// @desc    Get single item by ID
// @access  Public
router.get('/:id', 
  optionalAuth,
  validateObjectId(),
  async (req, res) => {
    try {
      const item = await Item.findById(req.params.id);

      if (!item || !item.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      // Increment views (but not for the owner)
      if (!req.user || req.user._id.toString() !== item.seller._id.toString()) {
        await item.incrementViews();
      }

      // Add user-specific data if authenticated
      if (req.user) {
        item.isLiked = item.isLikedBy(req.user._id);
      }

      res.json({
        success: true,
        data: { item }
      });

    } catch (error) {
      console.error('Get item error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching item'
      });
    }
  }
);

// @route   POST /api/items
// @desc    Create new item
// @access  Private
router.post('/',
  protect,
  uploadConfigs.itemImages.array('images', 5),
  handleMulterError,
  processUploadedFiles('items'),
  validateFileRequirements(true, 1, 5),
  validateItemCreation,
  async (req, res) => {
    try {
      const {
        title,
        description,
        price,
        originalPrice,
        category,
        subcategory,
        condition,
        tags,
        specifications,
        negotiable,
        urgent
      } = req.body;

      // Verify category exists
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }

      // Process uploaded images
      const images = req.uploadedFiles.map(file => ({
        url: file.url,
        alt: `${title} - Image`
      }));

      // Create item
      const item = await Item.create({
        title,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        category,
        subcategory,
        condition,
        images,
        seller: req.user._id,
        location: {
          hostel: req.user.hostel,
          room: req.user.room,
          campus: 'LPU Main Campus'
        },
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
        specifications: specifications ? JSON.parse(specifications) : {},
        negotiable: negotiable === 'true',
        urgent: urgent === 'true'
      });

      // Update category item count
      await categoryDoc.updateItemCount();

      res.status(201).json({
        success: true,
        message: 'Item created successfully',
        data: { item }
      });

    } catch (error) {
      console.error('Create item error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error creating item'
      });
    }
  }
);

// @route   PUT /api/items/:id
// @desc    Update item
// @access  Private (Owner only)
router.put('/:id',
  protect,
  validateObjectId(),
  checkOwnership(Item),
  async (req, res) => {
    try {
      const allowedUpdates = [
        'title', 'description', 'price', 'originalPrice', 'condition',
        'subcategory', 'tags', 'specifications', 'negotiable', 'urgent'
      ];

      const updates = {};
      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      // Parse numeric fields
      if (updates.price) updates.price = parseFloat(updates.price);
      if (updates.originalPrice) updates.originalPrice = parseFloat(updates.originalPrice);

      // Parse boolean fields
      if (updates.negotiable !== undefined) updates.negotiable = updates.negotiable === 'true';
      if (updates.urgent !== undefined) updates.urgent = updates.urgent === 'true';

      // Parse tags if provided
      if (updates.tags) {
        updates.tags = Array.isArray(updates.tags) ? updates.tags : updates.tags.split(',').map(t => t.trim());
      }

      // Parse specifications if provided
      if (updates.specifications && typeof updates.specifications === 'string') {
        updates.specifications = JSON.parse(updates.specifications);
      }

      const item = await Item.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Item updated successfully',
        data: { item }
      });

    } catch (error) {
      console.error('Update item error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating item'
      });
    }
  }
);

// @route   DELETE /api/items/:id
// @desc    Delete item
// @access  Private (Owner only)
router.delete('/:id',
  protect,
  validateObjectId(),
  checkOwnership(Item),
  async (req, res) => {
    try {
      await Item.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Item deleted successfully'
      });

    } catch (error) {
      console.error('Delete item error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error deleting item'
      });
    }
  }
);

// @route   POST /api/items/:id/like
// @desc    Toggle like on item
// @access  Private
router.post('/:id/like',
  protect,
  validateObjectId(),
  async (req, res) => {
    try {
      const item = await Item.findById(req.params.id);

      if (!item || !item.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      await item.toggleLike(req.user._id);

      res.json({
        success: true,
        message: 'Like toggled successfully',
        data: {
          isLiked: item.isLikedBy(req.user._id),
          likeCount: item.likeCount
        }
      });

    } catch (error) {
      console.error('Toggle like error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error toggling like'
      });
    }
  }
);

// @route   POST /api/items/:id/report
// @desc    Report an item
// @access  Private
router.post('/:id/report',
  protect,
  validateObjectId(),
  async (req, res) => {
    try {
      const { reason, description } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Report reason is required'
        });
      }

      const item = await Item.findById(req.params.id);

      if (!item || !item.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      // Check if user already reported this item
      const existingReport = item.reports.find(report =>
        report.user.toString() === req.user._id.toString()
      );

      if (existingReport) {
        return res.status(400).json({
          success: false,
          message: 'You have already reported this item'
        });
      }

      item.reports.push({
        user: req.user._id,
        reason,
        description
      });

      await item.save();

      res.json({
        success: true,
        message: 'Item reported successfully'
      });

    } catch (error) {
      console.error('Report item error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error reporting item'
      });
    }
  }
);

// @route   PUT /api/items/:id/status
// @desc    Update item availability status
// @access  Private (Owner only)
router.put('/:id/status',
  protect,
  validateObjectId(),
  checkOwnership(Item),
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!['available', 'sold', 'reserved', 'inactive'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const item = await Item.findByIdAndUpdate(
        req.params.id,
        { 'availability.status': status },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Item status updated successfully',
        data: { item }
      });

    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating status'
      });
    }
  }
);

module.exports = router;
