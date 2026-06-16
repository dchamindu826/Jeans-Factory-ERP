const express = require('express');
const router = express.Router();
const Payroll = require('../models/Payroll');

router.get('/', async (req, res) => {
  try {
    const payrolls = await Payroll.find().sort({ createdAt: -1 });
    res.status(200).json(payrolls);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payrolls' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { month, payrolls } = req.body;
    
    // Upsert (Update if exists, insert if new)
    const savedPayroll = await Payroll.findOneAndUpdate(
      { month },
      { month, payrolls },
      { new: true, upsert: true }
    );
    
    res.status(200).json(savedPayroll);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save payroll' });
  }
});

module.exports = router;
