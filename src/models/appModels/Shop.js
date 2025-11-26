const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
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
  // Shop Information fields
  slNo: String,
  date: Date,
  location: String,
  floor: String,
  size: String,
  facilities: String,
  unit: String,
  duration: String,
  price: String,
  remarks: String,
  reference: String,
  referenceName: String,
  
  // Shop Owner Information fields
  developer: String,
  ownerName: String,
  ownerNumber: String,
  remark: String,
  
  // Client fields
  name: String,
  number: String,
  budget: String,
  ref: String,
  refNo: String,
  refName: String,
  expectedLocation: String,
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
shopSchema.index({ category: 1, subCategory: 1 });
shopSchema.index({ location: 1 });
shopSchema.index({ name: 1 });
shopSchema.index({ createdBy: 1 });
shopSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('Shop', shopSchema);
