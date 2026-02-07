const mongoose = require('mongoose');

const projectLandSchema = new mongoose.Schema({
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
  location: String,
  area: String,
  refName: String,
  slNo: String,
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
projectLandSchema.index({ category: 1, subCategory: 1 });
projectLandSchema.index({ location: 1 });
projectLandSchema.index({ name: 1 });
projectLandSchema.index({ createdBy: 1 });
projectLandSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('ProjectFileLand', projectLandSchema, 'projectfileland');
