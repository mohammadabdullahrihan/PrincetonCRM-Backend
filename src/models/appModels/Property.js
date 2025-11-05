const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
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
  date: Date,
  name: String,
  number: String,
  budget: String,
  location: String,
  remark: String,
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
propertySchema.index({ category: 1, subCategory: 1 });
propertySchema.index({ location: 1 });
propertySchema.index({ name: 1 });
propertySchema.index({ createdBy: 1 });
propertySchema.index({ removed: 1, enabled: 1 });
propertySchema.index({ category: 1, subCategory: 1, budget: 1 });
propertySchema.index({ location: 'text', 'fields.Name': 'text', 'fields.Ref': 'text' });

module.exports = mongoose.model('Property', propertySchema);
