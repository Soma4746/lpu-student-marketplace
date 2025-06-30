const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');
const Review = require('../models/Review');
const Order = require('../models/Order');
const User = require('../models/User');
const Item = require('../models/Item');
const TalentProduct = require('../models/TalentProduct');

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      reviewee,
      orderId,
      itemId,
      talentProductId,
      type,
      rating,
      title,
      comment,
      images
    } = req.body;

    // Validate required fields
    if (!reviewee || !orderId || !type || !rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: reviewee, orderId, type, rating, title, comment'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if user can review
    const canReview = await Review.canUserReview(req.user._id, reviewee, type, orderId);
    if (!canReview.canReview) {
      return res.status(400).json({
        success: false,
        message: canReview.reason
      });
    }

    // Validate type-specific requirements
    if (type === 'item' && !itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required for item reviews'
      });
    }

    if (type === 'talent' && !talentProductId) {
      return res.status(400).json({
        success: false,
        message: 'Talent product ID is required for talent reviews'
      });
    }

    // Create review
    const review = await Review.create({
      reviewer: req.user._id,
      reviewee,
      order: orderId,
      item: type === 'item' ? itemId : undefined,
      talentProduct: type === 'talent' ? talentProductId : undefined,
      type,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      images: images || [],
      isVerified: true // Since it's based on a completed order
    });

    // Update user's rating statistics
    const userStats = await Review.getAverageRating(reviewee, 'user');
    await User.findByIdAndUpdate(reviewee, {
      'stats.rating': userStats.averageRating,
      'stats.totalRatings': userStats.totalReviews
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review }
    });

  } catch (error) {
    console.error('Review creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating review'
    });
  }
});

// @route   GET /api/reviews
// @desc    Get reviews with filtering
// @access  Public
router.get('/', 
  optionalAuth,
  validatePagination,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        reviewee,
        item,
        talentProduct,
        type,
        rating,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build query
      const query = {
        isActive: true,
        moderationStatus: 'approved'
      };

      if (reviewee) query.reviewee = reviewee;
      if (item) query.item = item;
      if (talentProduct) query.talentProduct = talentProduct;
      if (type) query.type = type;
      if (rating) query.rating = parseInt(rating);

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (page - 1) * limit;

      const [reviews, total] = await Promise.all([
        Review.find(query)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('item', 'title images')
          .populate('talentProduct', 'name images'),
        Review.countDocuments(query)
      ]);

      res.json({
        success: true,
        data: {
          reviews,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalReviews: total,
            hasNext: page * limit < total,
            hasPrev: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Reviews fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching reviews'
      });
    }
  }
);

// @route   GET /api/reviews/:id
// @desc    Get single review
// @access  Public
router.get('/:id',
  validateObjectId('id'),
  async (req, res) => {
    try {
      const review = await Review.findById(req.params.id)
        .populate('item', 'title images price')
        .populate('talentProduct', 'name images price')
        .populate('response.respondedBy', 'name avatar');

      if (!review || !review.isActive || review.moderationStatus !== 'approved') {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      res.json({
        success: true,
        data: { review }
      });

    } catch (error) {
      console.error('Review fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching review'
      });
    }
  }
);

// @route   PUT /api/reviews/:id
// @desc    Update review (only by reviewer)
// @access  Private
router.put('/:id',
  protect,
  validateObjectId('id'),
  async (req, res) => {
    try {
      const { rating, title, comment, images } = req.body;

      const review = await Review.findById(req.params.id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      // Check if user is the reviewer
      if (review.reviewer._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own reviews'
        });
      }

      // Update fields if provided
      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          return res.status(400).json({
            success: false,
            message: 'Rating must be between 1 and 5'
          });
        }
        review.rating = rating;
      }

      if (title !== undefined) review.title = title.trim();
      if (comment !== undefined) review.comment = comment.trim();
      if (images !== undefined) review.images = images;

      await review.save();

      // Update user's rating statistics if rating changed
      if (rating !== undefined) {
        const userStats = await Review.getAverageRating(review.reviewee, 'user');
        await User.findByIdAndUpdate(review.reviewee, {
          'stats.rating': userStats.averageRating,
          'stats.totalRatings': userStats.totalReviews
        });
      }

      res.json({
        success: true,
        message: 'Review updated successfully',
        data: { review }
      });

    } catch (error) {
      console.error('Review update error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating review'
      });
    }
  }
);

// @route   DELETE /api/reviews/:id
// @desc    Delete review (soft delete)
// @access  Private
router.delete('/:id',
  protect,
  validateObjectId('id'),
  async (req, res) => {
    try {
      const review = await Review.findById(req.params.id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      // Check if user is the reviewer or admin
      const isReviewer = review.reviewer._id.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isReviewer && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own reviews'
        });
      }

      // Soft delete
      review.isActive = false;
      await review.save();

      // Update user's rating statistics
      const userStats = await Review.getAverageRating(review.reviewee, 'user');
      await User.findByIdAndUpdate(review.reviewee, {
        'stats.rating': userStats.averageRating,
        'stats.totalRatings': userStats.totalReviews
      });

      res.json({
        success: true,
        message: 'Review deleted successfully'
      });

    } catch (error) {
      console.error('Review deletion error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error deleting review'
      });
    }
  }
);

// @route   POST /api/reviews/:id/helpful
// @desc    Vote review as helpful/not helpful
// @access  Private
router.post('/:id/helpful',
  protect,
  validateObjectId('id'),
  async (req, res) => {
    try {
      const { helpful } = req.body;

      if (typeof helpful !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Helpful must be a boolean value'
        });
      }

      const review = await Review.findById(req.params.id);

      if (!review || !review.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      // Prevent voting on own review
      if (review.reviewer._id.toString() === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'You cannot vote on your own review'
        });
      }

      await review.addHelpfulVote(req.user._id, helpful);

      res.json({
        success: true,
        message: 'Vote recorded successfully',
        data: { 
          helpfulVotes: review.helpfulVotes,
          totalVotes: review.votedBy.length
        }
      });

    } catch (error) {
      console.error('Review vote error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error recording vote'
      });
    }
  }
);

// @route   POST /api/reviews/:id/response
// @desc    Add response to review (by reviewee)
// @access  Private
router.post('/:id/response',
  protect,
  validateObjectId('id'),
  async (req, res) => {
    try {
      const { comment } = req.body;

      if (!comment || comment.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Response comment is required'
        });
      }

      const review = await Review.findById(req.params.id);

      if (!review || !review.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      // Check if user is the reviewee
      if (review.reviewee._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only respond to reviews about you'
        });
      }

      // Check if response already exists
      if (review.response && review.response.comment) {
        return res.status(400).json({
          success: false,
          message: 'You have already responded to this review'
        });
      }

      await review.addResponse(comment.trim(), req.user._id);

      res.json({
        success: true,
        message: 'Response added successfully',
        data: { review }
      });

    } catch (error) {
      console.error('Review response error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error adding response'
      });
    }
  }
);

// @route   GET /api/reviews/stats/:targetId/:targetType
// @desc    Get rating statistics for user/item/talent
// @access  Public
router.get('/stats/:targetId/:targetType',
  validateObjectId('targetId'),
  async (req, res) => {
    try {
      const { targetId, targetType } = req.params;

      if (!['user', 'item', 'talent'].includes(targetType)) {
        return res.status(400).json({
          success: false,
          message: 'Target type must be user, item, or talent'
        });
      }

      const stats = await Review.getAverageRating(targetId, targetType);

      res.json({
        success: true,
        data: { stats }
      });

    } catch (error) {
      console.error('Review stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching review statistics'
      });
    }
  }
);

// @route   GET /api/reviews/can-review/:orderId
// @desc    Check if user can review an order
// @access  Private
router.get('/can-review/:orderId',
  protect,
  validateObjectId('orderId'),
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Determine who the user can review
      let canReviewData = { canReview: false, reason: 'Invalid order state' };

      if (order.buyer._id.toString() === req.user._id.toString()) {
        // Buyer can review seller
        canReviewData = await Review.canUserReview(
          req.user._id,
          order.seller._id,
          order.type,
          order._id
        );
        canReviewData.reviewee = order.seller._id;
        canReviewData.revieweeType = 'seller';
      } else if (order.seller._id.toString() === req.user._id.toString()) {
        // Seller can review buyer
        canReviewData = await Review.canUserReview(
          req.user._id,
          order.buyer._id,
          order.type,
          order._id
        );
        canReviewData.reviewee = order.buyer._id;
        canReviewData.revieweeType = 'buyer';
      }

      res.json({
        success: true,
        data: canReviewData
      });

    } catch (error) {
      console.error('Can review check error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error checking review eligibility'
      });
    }
  }
);

module.exports = router;
