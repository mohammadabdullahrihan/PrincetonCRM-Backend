const mongoose = require('mongoose');

const apartmentOwnerSchema = new mongoose.Schema({
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
  floor: String,
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
apartmentOwnerSchema.index({ category: 1, subCategory: 1 });
apartmentOwnerSchema.index({ location: 1 });
apartmentOwnerSchema.index({ name: 1 });
apartmentOwnerSchema.index({ createdBy: 1 });
apartmentOwnerSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('ApartmentOwner', apartmentOwnerSchema);
