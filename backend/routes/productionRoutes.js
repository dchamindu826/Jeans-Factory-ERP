const express = require('express');
const router = express.Router();
const Production = require('../models/Production');

router.get('/', async (req, res) => {
  try {
    const logs = await Production.find().populate('customerId', 'name').populate('enteredBy', 'name').sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch production logs' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newLog = new Production(req.body);
    const savedLog = await newLog.save();
    res.status(201).json(savedLog);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save production log' });
  }
});

module.exports = router;
