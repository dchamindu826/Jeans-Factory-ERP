const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  type: { type: String, enum: ['customer_receipt', 'supplier_payment'], required: true },
  date: { type: String, required: true },
  amount: { type: Number, required: true },
  reference: { type: String }, // Cheque number, bank transfer ref
  
  // Relationships (one will be populated based on type)
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
