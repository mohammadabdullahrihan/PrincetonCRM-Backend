const mongoose = require('mongoose');

const commercialSchema = new mongoose.Schema({
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
  // Commercial Property Details fields
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
  
  // Commercial Owner Details fields
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
commercialSchema.index({ category: 1, subCategory: 1 });
commercialSchema.index({ location: 1 });
commercialSchema.index({ name: 1 });
commercialSchema.index({ createdBy: 1 });
commercialSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('Commercial', commercialSchema);
