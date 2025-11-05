const mongoose = require('mongoose');

const landBuyerSchema = new mongoose.Schema({
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
  // Land Sale specific fields
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
landBuyerSchema.index({ category: 1, subCategory: 1 });
landBuyerSchema.index({ location: 1 });
landBuyerSchema.index({ name: 1 });
landBuyerSchema.index({ createdBy: 1 });
landBuyerSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('LandBuyer', landBuyerSchema);
