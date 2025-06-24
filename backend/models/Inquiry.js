const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  userDetails: {
    name: { type: String, required: true },
    whatsappNumber: { type: String, required: true },
    address: { type: String },
  },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
  }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Null for guest
  status: { type: String, enum: ['pending', 'in progress', 'resolved'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);