const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  type: { type: String, default: 'system', unique: true },
  expenseCategories: { 
    type: [String], 
    default: ['Electricity', 'Water', 'Chemicals', 'Transport', 'Meals'] 
  },
  availableMonths: {
    type: [String],
    default: ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']
  },
  dryProcessTypes: {
    type: [String],
    default: ['Whiskers', 'Scraping', 'Grinding', 'Tacking', 'Destroying']
  },
  washProcessTypes: {
    type: [String],
    default: ['Enzyme Wash', 'Bleach Wash', 'Stone Wash', 'Acid Wash', 'Tinting']
  },
  savedStyles: {
    type: [String],
    default: ['STY-1001', 'STY-1002']
  }
});

module.exports = mongoose.model('Settings', SettingsSchema);
