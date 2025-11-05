const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
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
taskSchema.index({ category: 1, subCategory: 1 });
taskSchema.index({ location: 1 });
taskSchema.index({ name: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('Task', taskSchema);
