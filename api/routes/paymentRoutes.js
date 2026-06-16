const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');

// Get all payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

// Add a payment and update OD
router.post('/', async (req, res) => {
  try {
    const { type, amount, customerId, supplierId } = req.body;
    const newPayment = new Payment(req.body);
    const savedPayment = await newPayment.save();

    // Update Customer OD if receipt
    if (type === 'customer_receipt' && customerId) {
      await Customer.findByIdAndUpdate(customerId, { $inc: { od: -amount } });
    }
    
    // Update Supplier OD if settlement
    if (type === 'supplier_payment' && supplierId) {
      await Supplier.findByIdAndUpdate(supplierId, { $inc: { od: -amount } });
    }

    res.status(201).json(savedPayment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create payment', error: err.message });
  }
});

module.exports = router;
