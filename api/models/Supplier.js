const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  category: { type: String },
  od: { type: Number, default: 0 } // Outstanding Debt
}, { timestamps: true });

module.exports = mongoose.model('Supplier', SupplierSchema);
