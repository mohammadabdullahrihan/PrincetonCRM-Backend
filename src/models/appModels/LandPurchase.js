const mongoose = require('mongoose');

const landPurchaseSchema = new mongoose.Schema({
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
  // Land Purchase Information fields
  slNo: String,
  date: Date,
  name: String,
  cellNo: String,
  budget: String,
  refName: String,
  
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
landPurchaseSchema.index({ category: 1, subCategory: 1 });
landPurchaseSchema.index({ name: 1 });
landPurchaseSchema.index({ createdBy: 1 });
landPurchaseSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('LandPurchase', landPurchaseSchema);
