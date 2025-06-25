const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Inquiry = require('../models/Inquiry');
const authMiddleware = require('../middleware/auth');
const { sendVerificationEmail } = require('../services/emailService');
const router = express.Router();

// Get current user
router.get('/me', authMiddleware(['user', 'staff', 'admin']), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update current user profile
router.patch('/me', authMiddleware(['user', 'staff', 'admin']), async (req, res) => {
  const { name, email, whatsappNumber, address } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.whatsappNumber = whatsappNumber || user.whatsappNumber;
    user.address = address !== undefined ? address : user.address;

    await user.save();
    
    // Return user data without password
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create Staff Account (Admin Only)
router.post('/staff', authMiddleware(['admin']), async (req, res) => {
  const { name, email, whatsappNumber, password } = req.body;
  if (!name || !email || !whatsappNumber || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const staff = new User({
      name,
      email,
      whatsappNumber,
      password: hashedPassword,
      role: 'staff',
      isVerified: false,
      emailVerificationToken,
      emailVerificationExpires,
    });
    
    await staff.save();

    // Send verification email
    try {
      await sendVerificationEmail(staff, emailVerificationToken);
      res.status(201).json({ 
        message: 'Staff account created. Verification email sent.',
        user: { 
          id: staff._id, 
          name, 
          email, 
          role: 'staff',
          isVerified: false
        } 
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Delete the staff if email sending fails
      await User.findByIdAndDelete(staff._id);
      res.status(500).json({ message: 'Staff creation failed. Please try again.' });
    }
  } catch (err) {
    console.error('Staff creation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List All Users (Admin Only)
router.get('/', authMiddleware(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update User (Admin Only)
router.patch('/:id', authMiddleware(['admin']), async (req, res) => {
  const { name, email, whatsappNumber, role, password, isVerified } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.whatsappNumber = whatsappNumber || user.whatsappNumber;
    if (role && ['user', 'staff', 'admin'].includes(role)) {
      user.role = role;
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (isVerified !== undefined) {
      user.isVerified = isVerified;
      // Clear verification tokens if manually verified
      if (isVerified) {
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
      }
    }

    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (err) {
    console.error('User update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete User (Admin Only)
router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }
    await user.remove();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// View User Details and Activities (Admin/Staff)
router.get('/:id', authMiddleware(['admin', 'staff']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('wishlist cart');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const inquiries = await Inquiry.find({ userId: req.params.id });
    res.json({ user, inquiries });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



