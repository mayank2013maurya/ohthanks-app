const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const Category = require('../models/Category');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG/PNG images are allowed'));
  },
}).array('images', 5); // Max 5 images

// Get Featured Products (one random from each category)
router.get('/featured', async (req, res) => {
  try {
    const featuredProducts = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          product: { $first: '$$ROOT' } // A placeholder, will be random
        }
      },
      { $replaceRoot: { newRoot: '$product' } },
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' }
    ]);
    res.json(featuredProducts);
  } catch (err) {
    console.error('Error fetching featured products:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Products (Public)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const products = await Product.find(filter).populate('category', 'name description');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Product (Admin/Staff)
router.post('/', authMiddleware(['admin', 'staff']), upload, async (req, res) => {
  const { title, description, price, category, stockStatus } = req.body;
  if (!title || !description || !price || !category) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    const images = req.files.map(file => file.path);
    const product = new Product({
      title,
      description,
      price,
      category,
      stockStatus: stockStatus === 'true',
      images,
      createdBy: req.user.userId,
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Product (Admin/Staff)
router.delete('/:id', authMiddleware(['admin', 'staff']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Product by ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name description');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Product (Admin/Staff)
router.patch('/:id', authMiddleware(['admin', 'staff']), upload, async (req, res) => {
  const { title, description, price, category, stockStatus } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }
    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.stockStatus = stockStatus !== undefined ? stockStatus === 'true' : product.stockStatus;
    if (req.files.length > 0) {
      product.images = req.files.map(file => file.path);
    }
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Stock Status (Admin/Staff)
router.patch('/:id/stock', authMiddleware(['admin', 'staff']), async (req, res) => {
  const { stockStatus } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    product.stockStatus = stockStatus === 'true';
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;