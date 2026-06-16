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
    const newExpense = new Expense(req.body);
    const savedExpense = await newExpense.save();

    // Increase Supplier OD when bill is added
    if (supplierId) {
      await Supplier.findByIdAndUpdate(supplierId, { $inc: { od: amount } });
    }

    res.status(201).json(savedExpense);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create expense' });
  }
});

module.exports = router;
