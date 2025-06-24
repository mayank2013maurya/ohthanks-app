const express = require('express');
const Product = require('../models/Product');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Add Product to Wishlist (Registered Users)
router.post('/:productId', authMiddleware(['user', 'staff', 'admin']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const user = await User.findById(req.user.userId);
    if (user.wishlist.includes(req.params.productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    user.wishlist.push(req.params.productId);
    await user.save();
    res.json({ message: 'Product added to wishlist' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove Product from Wishlist (Registered Users)
router.delete('/:productId', authMiddleware(['user', 'staff', 'admin']), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
    await user.save();
    res.json({ message: 'Product removed from wishlist' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Wishlist (Registered Users)
router.get('/', authMiddleware(['user', 'staff', 'admin']), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('wishlist');
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Sync Wishlist from localStorage (Registered Users)
router.post('/sync', authMiddleware(['user', 'staff', 'admin']), async (req, res) => {
  const { productIds } = req.body; // Array of product IDs from localStorage
  if (!Array.isArray(productIds)) {
    return res.status(400).json({ message: 'Invalid request body, productIds must be an array.' });
  }
  try {
    const user = await User.findById(req.user.userId);
    const validProducts = await Product.find({ _id: { $in: productIds } });
    const validProductIds = validProducts.map(product => product._id.toString());

    const existingWishlistIds = user.wishlist.map(id => id.toString());
    const newProductIds = validProductIds.filter(id => !existingWishlistIds.includes(id));

    if (newProductIds.length > 0) {
      user.wishlist.push(...newProductIds);
      await user.save();
    }
    const updatedUser = await User.findById(req.user.userId).populate('wishlist');
    res.json(updatedUser.wishlist);
  } catch (err) {
    console.error('Error syncing wishlist:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear Wishlist
router.delete('/', authMiddleware(['user', 'staff', 'admin']), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.wishlist = [];
    await user.save();
    res.json({ message: 'Wishlist cleared successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;