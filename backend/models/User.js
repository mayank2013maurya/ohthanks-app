const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  whatsappNumber: { type: String, required: true },
  password: { type: String, required: true },
  address: { type: String },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Added cart field
  inquiries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry' }],
  role: { type: String, enum: ['user', 'staff', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);