const express = require('express');
const Category = require('../models/Category');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Create Category (Admin/Staff)
router.post('/', authMiddleware(['admin', 'staff']), async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  try {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    const category = new Category({
      name,
      description,
      createdBy: req.user.userId,
    });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Category (Admin/Staff)
router.patch('/:id', authMiddleware(['admin', 'staff']), async (req, res) => {
  const { name, description } = req.body;
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    if (name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory && existingCategory._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
    }
    category.name = name || category.name;
    category.description = description || category.description;
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Category (Admin/Staff)
router.delete('/:id', authMiddleware(['admin', 'staff']), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if there are any products using this category
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. There are ${productCount} product(s) using this category.` 
      });
    }
    
    // Use deleteOne instead of deprecated remove()
    await Category.deleteOne({ _id: req.params.id });
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get All Categories (Public) - Modified to include random product image
router.get('/', async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          randomImage: {
            $cond: {
              if: { $gt: [{ $size: '$products' }, 0] },
              then: {
                $let: {
                  vars: {
                    randomProduct: {
                      $arrayElemAt: [
                        '$products',
                        { $floor: { $multiply: [{ $rand: {} }, { $size: '$products' }] } }
                      ]
                    }
                  },
                  in: {
                    $cond: {
                      if: { $gt: [{ $size: '$$randomProduct.images' }, 0] },
                      then: { $arrayElemAt: ['$$randomProduct.images', 0] },
                      else: null
                    }
                  }
                }
              },
              else: null
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          createdBy: 1,
          createdAt: 1,
          updatedAt: 1,
          randomImage: 1
        }
      }
    ]);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Category by ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;