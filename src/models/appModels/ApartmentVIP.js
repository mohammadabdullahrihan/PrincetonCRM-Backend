const mongoose = require('mongoose');

const apartmentVIPSchema = new mongoose.Schema({
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
  // Apartment VIP specific fields
  slNo: String,
  date: Date,
  location: String,
  floor: String,
  size: String,
  facilities: String,
  unit: String,
  duration: String,
  price: String,
  remarks: String,
  reference: String,
  developer: String,
  ownerName: String,
  number: String,
  
  // VIP Client specific fields
  refNo: String,
  expectedLocation: String,
  status: String,
  
  // Legacy fields for backward compatibility
  name: String,
  budget: String,
  remark: String,
  ref: String,
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
apartmentVIPSchema.index({ category: 1, subCategory: 1 });
apartmentVIPSchema.index({ location: 1 });
apartmentVIPSchema.index({ name: 1 });
apartmentVIPSchema.index({ createdBy: 1 });
apartmentVIPSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('ApartmentVIP', apartmentVIPSchema);
