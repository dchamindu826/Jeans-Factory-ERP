const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Get Settings
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ type: 'system' });
    if (!settings) {
      settings = await Settings.create({ type: 'system' });
    }
    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

// Update Settings
router.put('/', async (req, res) => {
  try {
    const updated = await Settings.findOneAndUpdate(
      { type: 'system' }, 
      req.body, 
      { new: true, upsert: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

module.exports = router;
