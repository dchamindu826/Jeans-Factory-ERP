const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Supplier = require('../models/Supplier');

router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { amount, supplierId } = req.body;
    
    const expData = { ...req.body };
    if (!expData.issueNo) {
      const count = await Expense.countDocuments();
      expData.issueNo = `ISS-${2000 + count + 1}`;
    }

    const newExpense = new Expense(expData);
    const savedExpense = await newExpense.save();

    // Increase Supplier OD when bill is added
    if (supplierId) {
      await Supplier.findByIdAndUpdate(supplierId, { $inc: { od: amount } });
    }

    res.status(201).json(savedExpense);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create expense', error: err.message || err.toString() });
  }
});

module.exports = router;
