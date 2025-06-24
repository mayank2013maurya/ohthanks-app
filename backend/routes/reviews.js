const express = require('express');
const Review = require('../models/Review');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Create Review (Admin only)
router.post('/', authMiddleware(['admin']), async (req, res) => {
  const { name, review, rating } = req.body;
  try {
    const newReview = new Review({
      name,
      review,
      rating,
      createdBy: req.user.userId,
    });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get All Reviews (Public)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(4);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Reviews for Admin
router.get('/all', authMiddleware(['admin']), async (req, res) => {
    try {
      const reviews = await Review.find().sort({ createdAt: -1 });
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

// Update Review (Admin only)
router.patch('/:id', authMiddleware(['admin']), async (req, res) => {
  const { name, review, rating } = req.body;
  try {
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { name, review, rating },
      { new: true }
    );
    if (!updatedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(updatedReview);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete Review (Admin only)
router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    if (!deletedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 