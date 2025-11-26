const mongoose = require('mongoose');

const apartmentVIPClientSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  // We can keep category/subCategory if we want to maintain consistency, 
  // or just rely on the collection name. Let's keep the fields for consistency.
  category: {
    type: String,
    default: 'Apartment',
  },
  subCategory: {
    type: String,
    default: 'apartment-vip-client',
  },
  
  // Fields from apartmentVipClientFields in frontend
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
  
  // Standard fields
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

// Add indexes
apartmentVIPClientSchema.index({ name: 1 });
apartmentVIPClientSchema.index({ number: 1 });
apartmentVIPClientSchema.index({ createdBy: 1 });
apartmentVIPClientSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('ApartmentVIPClient', apartmentVIPClientSchema);
