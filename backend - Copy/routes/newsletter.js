const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter.js');
const authMiddleware = require('../middleware/auth.js');

// Subscribe to newsletter (public endpoint)
router.post('/subscribe', async (req, res) => {
  try {
    const { whatsappNumber, name, source = 'footer' } = req.body;

    // Validate required fields
    if (!whatsappNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'WhatsApp number is required' 
      });
    }

    // Basic WhatsApp number validation (should be exactly 10 digits)
    const whatsappRegex = /^\d{10}$/;
    if (!whatsappRegex.test(whatsappNumber)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid 10-digit WhatsApp number' 
      });
    }

    // Check if already subscribed
    const existingSubscription = await Newsletter.findOne({ whatsappNumber });
    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.status(400).json({ 
          success: false, 
          message: 'This WhatsApp number is already subscribed to our newsletter' 
        });
      } else {
        // Reactivate subscription
        existingSubscription.isActive = true;
        existingSubscription.name = name || existingSubscription.name;
        existingSubscription.source = source;
        await existingSubscription.save();
        
        return res.status(200).json({
          success: true,
          message: 'Welcome back! You have been resubscribed to our newsletter.',
          data: existingSubscription
        });
      }
    }

    // Create new subscription
    const newsletter = new Newsletter({
      whatsappNumber,
      name: name || '',
      source
    });

    await newsletter.save();

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to our newsletter! You will receive updates via WhatsApp.',
      data: newsletter
    });

  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Unsubscribe from newsletter (public endpoint)
router.post('/unsubscribe', async (req, res) => {
  try {
    const { whatsappNumber } = req.body;

    if (!whatsappNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'WhatsApp number is required' 
      });
    }

    const subscription = await Newsletter.findOne({ whatsappNumber });
    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscription not found' 
      });
    }

    subscription.isActive = false;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from our newsletter'
    });

  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});



// Get newsletter statistics (admin only)
router.get('/stats', authMiddleware(['admin', 'staff']), async (req, res) => {
  console.log('GET /newsletter/stats - Request received');
  console.log('User:', req.user);
  console.log('User role:', req.user?.role);
  
  try {

    console.log('Fetching newsletter statistics...');

    const totalSubscriptions = await Newsletter.countDocuments();
    const activeSubscriptions = await Newsletter.countDocuments({ isActive: true });
    const inactiveSubscriptions = await Newsletter.countDocuments({ isActive: false });

    console.log('Stats calculated:', { totalSubscriptions, activeSubscriptions, inactiveSubscriptions });

    // Get subscriptions by source
    const sourceStats = await Newsletter.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('Source stats:', sourceStats);

    // Get recent subscriptions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSubscriptions = await Newsletter.countDocuments({
      subscribedAt: { $gte: thirtyDaysAgo }
    });

    console.log('Recent subscriptions (30 days):', recentSubscriptions);

    res.status(200).json({
      success: true,
      data: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        inactive: inactiveSubscriptions,
        recent: recentSubscriptions,
        sourceStats: sourceStats
      }
    });

  } catch (error) {
    console.error('Error fetching newsletter statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete subscription (admin only)
router.delete('/:id', authMiddleware(['admin', 'staff']), async (req, res) => {
  try {


    const subscription = await Newsletter.findByIdAndDelete(req.params.id);
    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscription not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting newsletter subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all newsletter subscriptions (admin only)
router.get('/', authMiddleware(['admin', 'staff']), async (req, res) => {
  console.log('GET /newsletter - Request received');
  console.log('User:', req.user);
  console.log('User role:', req.user?.role);
  
  try {


    const { page = 1, limit = 20, search = '', status = 'all' } = req.query;
    const skip = (page - 1) * limit;

    console.log('Query params:', { page, limit, search, status });

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { whatsappNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    console.log('MongoDB query:', query);

    // Get subscriptions with pagination
    const subscriptions = await Newsletter.find(query)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log('Found subscriptions:', subscriptions.length);

    // Get total count
    const total = await Newsletter.countDocuments(query);

    console.log('Total subscriptions:', total);

    res.status(200).json({
      success: true,
      data: subscriptions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching newsletter subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 