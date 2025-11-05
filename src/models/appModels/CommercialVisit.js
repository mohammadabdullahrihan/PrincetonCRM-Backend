const mongoose = require('mongoose');

const commercialVisitSchema = new mongoose.Schema({
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
  
  // Commercial Visit specific fields
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
commercialVisitSchema.index({ category: 1, subCategory: 1 });
commercialVisitSchema.index({ visitedLocation: 1 });
commercialVisitSchema.index({ name: 1 });
commercialVisitSchema.index({ createdBy: 1 });
commercialVisitSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('CommercialVisit', commercialVisitSchema);
