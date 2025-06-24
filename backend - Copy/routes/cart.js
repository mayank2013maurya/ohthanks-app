const express = require('express');
const Product = require('../models/Product');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Add Product to Cart (Registered Users)
router.post('/:productId', authMiddleware(['user', 'staff', 'admin']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const user = await User.findById(req.user.userId);
    if (!user.cart) user.cart = [];
    if (user.cart.includes(req.params.productId)) {
      return res.status(400).json({ message: 'Product already in cart' });
    }
    user.cart.push(req.params.productId);
    await user.save();
    res.json({ message: 'Product added to cart' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove Product from Cart (Registered Users)
router.delete('/:productId', authMiddleware(['user', 'staff', 'admin']), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.cart = user.cart.filter(id => id.toString() !== req.params.productId);
    await user.save();
    res.json({ message: 'Product removed from cart' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Cart (Registered Users)
router.get('/', authMiddleware(['user', 'staff', 'admin']), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('cart');
    res.json(user.cart || []);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Sync Cart from localStorage (Registered Users)
router.post('/sync', authMiddleware(['user', 'staff', 'admin']), async (req, res) => {
  const { cart } = req.body; // Array of product IDs from localStorage
  try {
    const user = await User.findById(req.user.userId);
    const validProducts = await Product.find({ _id: { $in: cart } });
    const validProductIds = validProducts.map(product => product._id.toString());
    user.cart = [...new Set([...(user.cart || []), ...validProductIds])]; // Merge and deduplicate
    await user.save();
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;