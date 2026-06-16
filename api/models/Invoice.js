const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  date: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  qty: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  // Snapshot of what the invoice actually looks like:
  items: [{
    styleNo: { type: String },
    description: { type: String },
    unitPrice: { type: Number },
    quantity: { type: Number },
    total: { type: Number }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
