const mongoose = require('mongoose');

const landSchema = new mongoose.Schema({
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
  // Land Information fields
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
  
  // Additional fields
  location: String,
  ref: String,
  refName: String,
  status: String,
  
  // Visit tracking fields
  visitedLocation: String,
  whoVisited: String,
  
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
landSchema.index({ category: 1, subCategory: 1 });
landSchema.index({ location: 1 });
landSchema.index({ name: 1 });
landSchema.index({ createdBy: 1 });
landSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('Land', landSchema);
