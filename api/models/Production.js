const mongoose = require('mongoose');

const ProductionSchema = new mongoose.Schema({
  date: { type: String, required: true },
  styleNo: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  
  // E.g. 'Dry Process' or 'Wash Type'
  mainProcessType: { type: String, required: true, enum: ['Dry Process', 'Wash Type'] },
  
  // E.g. 'Scraping', 'Enzyme Wash'
  subProcess: { type: String, required: true },
  
  qty: { type: Number, required: true },
  
  // Track which employee entered this
  enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Production', ProductionSchema);
