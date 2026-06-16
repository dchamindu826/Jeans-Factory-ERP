const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema({
  month: { type: String, required: true }, // e.g., 'June 2026'
  payrolls: [{
    empId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String }, // Snapshot at time of generation
    basicSalary: { type: Number },
    salaryType: { type: String },
    otHours: { type: Number, default: 0 },
    allowance: { type: Number, default: 0 },
    incentive: { type: Number, default: 0 },
    advance: { type: Number, default: 0 },
    nonPaidDays: { type: Number, default: 0 },
    
    // Calculated Final Amounts (Snapshot)
    perDayRate: { type: Number },
    otRate: { type: Number },
    netSalary: { type: Number }
  }]
}, { timestamps: true });

// Ensure one payroll document per month
PayrollSchema.index({ month: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', PayrollSchema);
