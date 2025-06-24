const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact.js');
const authMiddleware = require('../middleware/auth.js');

// Get all contacts (admin only)
router.get('/', authMiddleware(['admin', "staff"]), async (req, res) => {
  try { 
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      data: contacts
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update contact status (admin only)
router.patch('/:id/status', authMiddleware(['admin', "staff"]), async (req, res) => {
  try {

    const { status } = req.body;

    if (!status || !['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (new, read, or replied)'
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-__v');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      data: contact
    });

  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get contact by ID (admin only)
router.get('/:id', authMiddleware(['admin', "staff"]), async (req, res) => {
  try {


    const contact = await Contact.findById(req.params.id).select('-__v');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      data: contact
    });

  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete contact (admin only)
router.delete('/:id', authMiddleware(['admin', "staff"]), async (req, res) => {
  try {


    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Submit contact form (public endpoint)
router.post('/', async (req, res) => {
  try {
    const { name, whatsappNumber, address, message, addToMailingList } = req.body;

    // Validate required fields
    if (!name || !whatsappNumber || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, WhatsApp number, and message are required' 
      });
    }

    // Validate WhatsApp number format (10 digits only)
    const whatsappRegex = /^\d{10}$/;
    if (!whatsappRegex.test(whatsappNumber)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid 10-digit WhatsApp number' 
      });
    }

    // Create new contact
    const contact = new Contact({
      name,
      whatsappNumber,
      address: address || '',
      message,
      addToMailingList: addToMailingList || false
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully! We will get back to you soon.',
      data: contact
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 