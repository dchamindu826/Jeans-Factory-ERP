const express = require('express');
const router = express.Router();

const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Invoice = require('../models/Invoice');
const GatePass = require('../models/GatePass');
const User = require('../models/User');
const Salary = require('../models/Salary');
const Expense = require('../models/Expense');
const Production = require('../models/Production');
const Payment = require('../models/Payment');
const Settings = require('../models/Settings');

router.get('/', async (req, res) => {
  try {
    const [customers, suppliers, invoices, gatepasses, staff, salaries, expenses, productions, payments, settings] = await Promise.all([
      Customer.find().sort({ createdAt: -1 }),
      Supplier.find().sort({ createdAt: -1 }),
      Invoice.find().sort({ createdAt: -1 }),
      GatePass.find().sort({ createdAt: -1 }),
      User.find().sort({ createdAt: -1 }),
      Salary.find().sort({ createdAt: -1 }),
      Expense.find().sort({ createdAt: -1 }),
      Production.find().sort({ createdAt: -1 }),
      Payment.find().sort({ createdAt: -1 }),
      Settings.findOne()
    ]);
    
    res.json({
      customers, 
      suppliers, 
      invoices, 
      gatepasses, 
      staff, 
      salaries, 
      expenses, 
      productions, 
      payments, 
      settings: settings || { expenseCategories: [], availableMonths: [] }
    });
  } catch(err) {
    res.status(500).json({ message: "Sync failed", error: err.message });
  }
});

module.exports = router;
