const mongoose = require('mongoose');

const commercialBuyerSchema = new mongoose.Schema({
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
  // Commercial Sale specific fields
  slNo: String,
  date: Date,
  location: String,
  floor: Number,
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
  
  // Legacy fields
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
commercialBuyerSchema.index({ category: 1, subCategory: 1 });
commercialBuyerSchema.index({ location: 1 });
commercialBuyerSchema.index({ name: 1 });
commercialBuyerSchema.index({ createdBy: 1 });
commercialBuyerSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('CommercialBuyer', commercialBuyerSchema);
