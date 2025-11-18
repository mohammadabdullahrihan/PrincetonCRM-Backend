const mongoose = require('mongoose');

const apartmentBuyerSchema = new mongoose.Schema({
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
  // Apartment Sale specific fields
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
  referenceName: String,
  developer: String,
  ownerName: String,
  number: String,
  
  // Legacy fields for backward compatibility
  name: String,
  budget: String,
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
apartmentBuyerSchema.index({ category: 1, subCategory: 1 });
apartmentBuyerSchema.index({ location: 1 });
apartmentBuyerSchema.index({ name: 1 });
apartmentBuyerSchema.index({ createdBy: 1 });
apartmentBuyerSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('ApartmentBuyer', apartmentBuyerSchema, 'apartmentsales');
