const mongoose = require('mongoose');

const investorVIPSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Apartment',
      'Land',
      'Shop',
      'CommercialSpace',
      'JointVenture',
      'Investor',
      'ClientUniversal',
    ],
  },
  subCategory: {
    type: String,
    required: true,
  },
  // Investor VIP specific fields
  slNo: String,
  date: Date,
  refNo: String,
  ref: String,
  name: String,
  number: String,
  budget: String,
  expectedLocation: String,
  remark: String,
  status: String,
  
  // Investor specific fields
  investorName: String,
  investorType: String,
  phone: String,
  email: String,
  investmentCapacity: String,
  preferredPropertyTypes: String,
  
  // Legacy fields
  location: String,
  customFields: Object,
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for better performance
investorVIPSchema.index({ category: 1, subCategory: 1 });
investorVIPSchema.index({ location: 1 });
investorVIPSchema.index({ name: 1 });
investorVIPSchema.index({ createdBy: 1 });
investorVIPSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('InvestorVIP', investorVIPSchema);
