const mongoose = require('mongoose');

const LegalContentSchema = new mongoose.Schema({
  contentType: {
    type: String,
    required: true,
    unique: true,
    enum: ['privacy-policy', 'terms-and-conditions', 'disclaimer'],
  },
  content: {
    type: String,
    required: true,
    default: 'Please edit this content.',
  },
}, { timestamps: true });

module.exports = mongoose.model('LegalContent', LegalContentSchema); 