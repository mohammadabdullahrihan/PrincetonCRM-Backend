const mongoose = require('mongoose');

const clientUniversalSchema = new mongoose.Schema({
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
  // Client Information fields
  slNo: String,
  date: Date,
  refNo: String,
  ref: String,
  name: String,
  number: String,
  budget: String,
  expectedLocation: String,
  remark: String,
  status: String,
  
  // Additional fields
  location: String,
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
clientUniversalSchema.index({ category: 1, subCategory: 1 });
clientUniversalSchema.index({ location: 1 });
clientUniversalSchema.index({ name: 1 });
clientUniversalSchema.index({ createdBy: 1 });
clientUniversalSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('ClientUniversal', clientUniversalSchema);
