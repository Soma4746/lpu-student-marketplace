const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');
const Category = require('../models/Category');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { tree, featured } = req.query;

    let categories;

    if (tree === 'true') {
      // Get categories as tree structure
      categories = await Category.getTree();
    } else if (featured === 'true') {
      // Get only featured categories
      categories = await Category.find({ 
        isActive: true, 
        isFeatured: true 
      }).sort({ order: 1, name: 1 });
    } else {
      // Get all active categories
      categories = await Category.find({ isActive: true })
        .sort({ order: 1, name: 1 });
    }

    res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching categories'
    });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category by ID
// @access  Public
router.get('/:id',
  validateObjectId(),
  async (req, res) => {
    try {
      const category = await Category.findById(req.params.id)
        .populate('children')
        .populate('parent');

      if (!category || !category.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        data: { category }
      });

    } catch (error) {
      console.error('Get category error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching category'
      });
    }
  }
);

// @route   GET /api/categories/slug/:slug
// @desc    Get category by slug
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    })
    .populate('children')
    .populate('parent');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: { category }
    });

  } catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching category'
    });
  }
});

// @route   GET /api/categories/popular
// @desc    Get popular categories
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const categories = await Category.getPopular(parseInt(limit));

    res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('Get popular categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching popular categories'
    });
  }
});

// @route   POST /api/categories
// @desc    Create new category
// @access  Private (Admin only)
router.post('/',
  protect,
  admin,
  async (req, res) => {
    try {
      const {
        name,
        description,
        icon,
        color,
        subcategories,
        parent,
        order,
        isFeatured
      } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required'
        });
      }

      // Check if category already exists
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category already exists'
        });
      }

      // Determine level based on parent
      let level = 0;
      if (parent) {
        const parentCategory = await Category.findById(parent);
        if (!parentCategory) {
          return res.status(400).json({
            success: false,
            message: 'Parent category not found'
          });
        }
        level = parentCategory.level + 1;
      }

      const category = await Category.create({
        name,
        description,
        icon: icon || 'package',
        color: color || '#3B82F6',
        subcategories: subcategories || [],
        parent: parent || null,
        level,
        order: order || 0,
        isFeatured: isFeatured || false
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { category }
      });

    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error creating category'
      });
    }
  }
);

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private (Admin only)
router.put('/:id',
  protect,
  admin,
  validateObjectId(),
  async (req, res) => {
    try {
      const allowedUpdates = [
        'name', 'description', 'icon', 'color', 'subcategories',
        'order', 'isFeatured', 'isActive'
      ];

      const updates = {};
      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      const category = await Category.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: { category }
      });

    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating category'
      });
    }
  }
);

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private (Admin only)
router.delete('/:id',
  protect,
  admin,
  validateObjectId(),
  async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Check if category has items
      const Item = require('../models/Item');
      const itemCount = await Item.countDocuments({ category: req.params.id });

      if (itemCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete category. It has ${itemCount} items associated with it.`
        });
      }

      // Check if category has children
      const childrenCount = await Category.countDocuments({ parent: req.params.id });

      if (childrenCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete category. It has ${childrenCount} subcategories.`
        });
      }

      await Category.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });

    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error deleting category'
      });
    }
  }
);

// @route   PUT /api/categories/:id/stats
// @desc    Update category statistics
// @access  Private (Admin only)
router.put('/:id/stats',
  protect,
  admin,
  validateObjectId(),
  async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Update item count and talent product count
      await Promise.all([
        category.updateItemCount(),
        category.updateTalentProductCount()
      ]);

      res.json({
        success: true,
        message: 'Category statistics updated successfully',
        data: { 
          category: {
            _id: category._id,
            name: category.name,
            stats: category.stats
          }
        }
      });

    } catch (error) {
      console.error('Update category stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating category statistics'
      });
    }
  }
);

module.exports = router;
