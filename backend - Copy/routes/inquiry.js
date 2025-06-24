const express = require('express');
const Product = require('../models/Product');
const Inquiry = require('../models/Inquiry');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const optionalAuthMiddleware = require('../middleware/optionalAuth');
const router = express.Router();

// Generate WhatsApp Inquiry for Single Product
router.post('/product/:productId', optionalAuthMiddleware, async (req, res) => {
  const { name, whatsappNumber, address } = req.body;
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    let userId = null;
    let userDetails = { name, whatsappNumber, address };
    if (req.user) { // Registered user
      const user = await User.findById(req.user.userId);
      userDetails = {
        name: user.name,
        whatsappNumber: user.whatsappNumber,
        address: user.address || address,
      };
      userId = user._id;
    } else if (!name || !whatsappNumber) { // Guest
      return res.status(400).json({ message: 'Name and WhatsApp number are required for guests' });
    } else {
      // Validate WhatsApp number format for guests (10 digits only)
      const whatsappRegex = /^\d{10}$/;
      if (!whatsappRegex.test(whatsappNumber)) {
        return res.status(400).json({ message: 'Please enter a valid 10-digit WhatsApp number' });
      }
    }
    const inquiry = new Inquiry({
      userDetails,
      products: [{
        productId: product._id,
        title: product.title,
        price: product.price,
      }],
      userId,
    });
    await inquiry.save();
    const message = encodeURIComponent(
      `Inquiry from ${userDetails.name}, WhatsApp: ${userDetails.whatsappNumber}, ` +
      `Address: ${userDetails.address || 'Not provided'}, ` +
      `Product: ${product.title}, Price: ₹${product.price}`
    );
    const whatsappLink = `https://wa.me/${process.env.STORE_WHATSAPP}?text=${message}`;
    res.json({ whatsappLink, inquiry });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate WhatsApp Inquiry for Cart Items
router.post('/cart', authMiddleware(['user', 'staff', 'admin']), async (req, res) => {
  const { name, whatsappNumber, address } = req.body;
  try {
    const user = await User.findById(req.user.userId).populate('cart');
    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    let userDetails = { name: user.name, whatsappNumber: user.whatsappNumber, address: user.address || address };
    if (!req.user) { // Guest (not applicable here due to auth middleware, included for consistency)
      if (!name || !whatsappNumber) {
        return res.status(400).json({ message: 'Name and WhatsApp number are required for guests' });
      }
      userDetails = { name, whatsappNumber, address };
    }
    const products = user.cart.map(product => ({
      productId: product._id,
      title: product.title,
      price: product.price,
    }));
    const inquiry = new Inquiry({
      userDetails,
      products,
      userId: user._id,
    });
    await inquiry.save();
    const productList = products.map(p => `${p.title} (Price: ₹${p.price})`).join(', ');
    const message = encodeURIComponent(
      `Inquiry from ${userDetails.name}, WhatsApp: ${userDetails.whatsappNumber}, ` +
      `Address: ${userDetails.address || 'Not provided'}, ` +
      `Products: ${productList}`
    );
    const whatsappLink = `https://wa.me/${process.env.STORE_WHATSAPP}?text=${message}`;
    res.json({ whatsappLink, inquiry });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Inquiry Status (Admin/Staff)
router.patch('/:id/status', authMiddleware(['admin', 'staff']), async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'sale', 'returned'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    inquiry.status = status;
    await inquiry.save();
    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Inquiries (Admin/Staff)
router.get('/', authMiddleware(['admin', 'staff']), async (req, res) => {
  try {
    const inquiries = await Inquiry.find().populate('products.productId', 'title price');
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Specific Inquiry by ID (Admin/Staff)
router.get('/:id', authMiddleware(['admin', 'staff']), async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id).populate('products.productId', 'title price');
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Inquiry (Admin Only)
router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    await inquiry.remove();
    res.json({ message: 'Inquiry deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;