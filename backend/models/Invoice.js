const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  date: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  gatePassNo: { type: String },
  qty: { type: Number, required: true },
  grossAmount: { type: Number },
  vatPercentage: { type: Number, default: 18 },
  vatAmount: { type: Number },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  // Snapshot of what the invoice actually looks like:
  items: [{
    styleNo: { type: String },
    description: { type: String },
    dryProcess: { type: String },
    washType: { type: String },
    unitPrice: { type: Number },
    quantity: { type: Number },
    total: { type: Number }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
