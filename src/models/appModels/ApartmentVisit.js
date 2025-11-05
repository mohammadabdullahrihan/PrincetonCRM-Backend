const mongoose = require('mongoose');

const apartmentVisitSchema = new mongoose.Schema({
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
  
  // Apartment Visit specific fields
  slNo: String,
  date: Date,
  refNo: String,
  refName: String,
  name: String,
  number: String,
  budget: String,
  visitedLocation: String,
  whoVisited: String,
  
  // Legacy fields
  location: String,
  remark: String,
  ref: String,
  note: String,
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
apartmentVisitSchema.index({ category: 1, subCategory: 1 });
apartmentVisitSchema.index({ visitedLocation: 1 });
apartmentVisitSchema.index({ name: 1 });
apartmentVisitSchema.index({ createdBy: 1 });
apartmentVisitSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('ApartmentVisit', apartmentVisitSchema);
