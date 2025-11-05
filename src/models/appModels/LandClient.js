const mongoose = require('mongoose');

const schema = new mongoose.Schema({
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
  
  // Land Client specific fields
  slNo: String,
  date: Date,
  refNo: String,
  ref: String,
  name: {
    type: String,
    required: true,
  },
  number: String,
  budget: String,
  expectedLocation: String,
  remark: String,
  status: String,
  
  // Legacy fields
  phone: String,
  country: String,
  address: String,
  email: String,
  customFields: Object,
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  assigned: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

schema.plugin(require('mongoose-autopopulate'));

// Add indexes for better performance
schema.index({ name: 1 });
schema.index({ email: 1 });
schema.index({ phone: 1 });
schema.index({ country: 1 });
schema.index({ createdBy: 1 });
schema.index({ assigned: 1 });
schema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('LandClient', schema);
