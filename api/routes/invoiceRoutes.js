const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');

router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('customerId', 'name').sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { amount, customerId } = req.body;
    const newInvoice = new Invoice(req.body);
    const savedInvoice = await newInvoice.save();

    // Increase Customer OD when invoice is created
    if (customerId) {
      await Customer.findByIdAndUpdate(customerId, { $inc: { od: amount } });
    }

    res.status(201).json(savedInvoice);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create invoice' });
  }
});

module.exports = router;
