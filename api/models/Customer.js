const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  image: { type: String }, // URL or path
  od: { type: Number, default: 0 } // Outstanding Debt
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
