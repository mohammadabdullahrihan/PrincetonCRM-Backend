const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    // Basic operational flags
    removed: { type: Boolean, default: false },
    enabled: { type: Boolean, default: true },

    // Linking fields
    entryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' }, // Optional if linked to Property
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },

    // Categorization
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
    subCategory: { type: String, required: true },

    // Visit information
    slNo: String,
    date: { type: Date, default: Date.now },
    refNo: String,
    refName: String,
    name: String,
    number: String,
    budget: String,
    visitedLocation: String,
    whoVisited: String,
    
    // Legacy fields
    location: String,
    remark: String,
    ref: String,

    // Employee or client note
    note: String,
    customFields: Object,

    // Auto timestamps
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for faster queries
visitSchema.index({ category: 1, subCategory: 1 });
visitSchema.index({ location: 1 });
visitSchema.index({ name: 1 });
visitSchema.index({ createdBy: 1 });
visitSchema.index({ removed: 1, enabled: 1 });
visitSchema.index({ entryId: 1 });
visitSchema.index({ employeeId: 1 });

module.exports = mongoose.model('Visit', visitSchema);

// const mongoose = require('mongoose');

// const visitSchema = new mongoose.Schema({
//   removed: {
//     type: Boolean,
//     default: false,
//   },
//   enabled: {
//     type: Boolean,
//     default: true,
//   },
//   category: {
//     type: String,
//     required: true,
//     enum: [
//       'Apartment', 'Land', 'Shop', 'CommercialSpace',
//       'JointVenture', 'Investor', 'ClientUniversal'
//     ]
//   },
//   subCategory: {
//     type: String,
//     required: true,
//   },
//   date: Date,
//   name: String,
//   number: String,
//   budget: String,
//   location: String,
//   remark: String,
//   ref: String,
//   customFields: Object, // optional dynamic fields if needed
//   createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
//   created: {
//     type: Date,
//     default: Date.now,
//   },
//   updated: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Add indexes for better performance
// visitSchema.index({ category: 1, subCategory: 1 });
// visitSchema.index({ location: 1 });
// visitSchema.index({ name: 1 });
// visitSchema.index({ createdBy: 1 });
// visitSchema.index({ removed: 1, enabled: 1 });

// module.exports = mongoose.model('Visit', visitSchema);
