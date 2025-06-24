const express = require('express');
const router = express.Router();
const LegalContent = require('../models/LegalContent');
const authMiddleware = require('../middleware/auth'); 

// Get legal content
router.get('/:contentType', authMiddleware(['admin']), async (req, res) => {
  try {
    const { contentType } = req.params;
    let legalContent = await LegalContent.findOne({ contentType });

    if (!legalContent) {
      // Create if it doesn't exist
      legalContent = new LegalContent({ contentType, content: `<h1>${contentType.replace('-', ' ')}</h1><p>Please edit this content.</p>` });
      await legalContent.save();
    }

    res.json(legalContent);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update legal content
router.put('/:contentType', authMiddleware(['admin']), async (req, res) => {
  try {
    const { contentType } = req.params;
    const { content } = req.body;

    let legalContent = await LegalContent.findOne({ contentType });

    if (!legalContent) {
      return res.status(404).json({ msg: 'Content not found' });
    }

    legalContent.content = content;
    await legalContent.save();

    res.json(legalContent);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 