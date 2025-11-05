const mongoose = require('mongoose');

const landVIPSchema = new mongoose.Schema({
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
  // Land VIP specific fields
  slNo: String,
  date: Date,
  name: String,
  number: String,
  budget: String,
  refNo: String,
  expectedLocation: String,
  size: String,
  developer: String,
  ownerName: String,
  ownerNumber: String,
  remark: String,
  status: String,
  
  // Legacy fields
  location: String,
  ref: String,
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
landVIPSchema.index({ category: 1, subCategory: 1 });
landVIPSchema.index({ location: 1 });
landVIPSchema.index({ name: 1 });
landVIPSchema.index({ createdBy: 1 });
landVIPSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('LandVIP', landVIPSchema);
