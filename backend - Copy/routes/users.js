const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Inquiry = require('../models/Inquiry');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Helper function to create email transporter
const createTransport = () => {
  if (!process.env.NODEMAILER_HOST || !process.env.NODEMAILER_USER || !process.env.NODEMAILER_PASS) {
    throw new Error('Email configuration missing');
  }

  return nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT || 587,
    secure: process.env.NODEMAILER_SECURE === 'true',
    requireTLS: process.env.NODEMAILER_REQUIRETLS === 'true',
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });
};

// Helper function to send verification email
const sendVerificationEmail = async (user, token) => {
  const transporter = createTransport();
  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email/${token}`;
  
  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: user.email,
    subject: 'Verify Your Email - Oh Thanks',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Oh Thanks!</h2>
        <p>Hello ${user.name},</p>
        <p>Thank you for registering with Oh Thanks. Please verify your email address to complete your registration.</p>
        <p>Click the button below to verify your email:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Verify Email</a>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
        <p><strong>This link will expire in 24 hours.</strong></p>
        <p>If you didn't create an account, please ignore this email.</p>
        <p>Best regards,<br>The Oh Thanks Team</p>
      </div>
    `,
    text: `Click the link to verify your email: ${verificationUrl}`,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Verification email sent to ${user.email}`);
};

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



