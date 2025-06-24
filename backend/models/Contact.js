const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  whatsappNumber: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String,
    required: false 
  },
  message: { 
    type: String, 
    required: true 
  },
  addToMailingList: { 
    type: Boolean, 
    default: false 
  },
  status: { 
    type: String, 
    enum: ['new', 'read', 'replied'], 
    default: 'new' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema); 