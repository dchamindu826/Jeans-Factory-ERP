const mongoose = require('mongoose');

const GatePassSchema = new mongoose.Schema({
  date: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  vehicleNo: { type: String },
  driverName: { type: String },
  items: [{
    styleNo: { type: String },
    quantity: { type: Number },
    description: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('GatePass', GatePassSchema);
