const express = require('express');
const router = express.Router();
const GatePass = require('../models/GatePass');

router.get('/', async (req, res) => {
  try {
    const passes = await GatePass.find().populate('customerId', 'name').sort({ createdAt: -1 });
    res.status(200).json(passes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch gate passes' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newPass = new GatePass(req.body);
    const savedPass = await newPass.save();
    res.status(201).json(savedPass);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create gate pass' });
  }
});

module.exports = router;
