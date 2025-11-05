const mongoose = require('mongoose');

const jointVentureSchema = new mongoose.Schema({
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
  // Joint Venture Information fields
  slNo: String,
  date: Date,
  refName: String,
  location: String,
  land: String,
  face: String,
  road: String,
  owner: String,
  signingMoney: String,
  remark: String,
  
  // JV Owner Proposal fields
  proposalDetails: String,
  proposalDate: Date,
  
  // Visit tracking fields
  name: String,
  number: String,
  budget: String,
  refNo: String,
  visitedLocation: String,
  whoVisited: String,
  
  // Legacy fields
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
jointVentureSchema.index({ category: 1, subCategory: 1 });
jointVentureSchema.index({ location: 1 });
jointVentureSchema.index({ name: 1 });
jointVentureSchema.index({ createdBy: 1 });
jointVentureSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('JointVenture', jointVentureSchema);
