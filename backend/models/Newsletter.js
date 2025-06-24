const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  whatsappNumber: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  name: { 
    type: String, 
    required: false,
    trim: true
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  source: { 
    type: String, 
    enum: ['footer', 'contact_form', 'manual'], 
    default: 'footer' 
  },
  subscribedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Index for faster queries
newsletterSchema.index({ whatsappNumber: 1 });
newsletterSchema.index({ isActive: 1 });
newsletterSchema.index({ subscribedAt: -1 });

module.exports = mongoose.model('Newsletter', newsletterSchema); 