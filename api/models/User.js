const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Will be hashed later
  role: { type: String, enum: ['manager', 'employee'], default: 'employee' },
  
  // Salary details
  basicSalary: { type: Number, default: 0 },
  salaryType: { type: String, enum: ['standard', 'fixed'], default: 'standard' },
  
  // Banking details
  bankName: { type: String, default: '' },
  accNo: { type: String, default: '' },
  branch: { type: String, default: '' },
  beneficiaryName: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
