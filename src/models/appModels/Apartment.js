const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema({
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
  // Apartment Information fields
  slNo: String,
  location: String,
  floor: Number,
  size: String,
  facilities: String,
  date: Date,
  unit: String,
  duration: String,
  price: String,
  remarks: String,
  reference: String,
  
  // Owner Information fields
  developer: String,
  ownerName: String,
  number: String,
  
  // Legacy/common fields
  name: String,
  budget: String,
  remark: String,
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
apartmentSchema.index({ category: 1, subCategory: 1 });
apartmentSchema.index({ location: 1 });
apartmentSchema.index({ name: 1 });
apartmentSchema.index({ createdBy: 1 });
apartmentSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('Apartment', apartmentSchema);
