const mongoose = require('mongoose');

const investorSchema = new mongoose.Schema({
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
  // Investor Information fields
  slNo: String,
  investorName: String,
  investorType: String,
  phone: String,
  email: String,
  
  // Investment Details fields
  investmentCapacity: String,
  preferredPropertyTypes: String,
  status: String,
  
  // Legacy/common fields
  date: Date,
  name: String,
  number: String,
  budget: String,
  location: String,
  remark: String,
  ref: String,
  
  customFields: Object, // optional dynamic fields if needed
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
investorSchema.index({ category: 1, subCategory: 1 });
investorSchema.index({ location: 1 });
investorSchema.index({ name: 1 });
investorSchema.index({ createdBy: 1 });
investorSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('Investor', investorSchema);
