const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  issueNo: { type: String, required: true },
  date: { type: String, required: true },
  category: { type: String, required: true },
  reason: { type: String },
  amount: { type: Number, required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' } // Nullable if general expense
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
