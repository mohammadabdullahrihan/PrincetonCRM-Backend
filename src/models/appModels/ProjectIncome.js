const mongoose = require('mongoose');

const projectIncomeSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  date: {
    type: Date,
    required: true,
  },
  refName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  incomeCategory: {
    type: String,
    enum: ['Project Sale', 'Token Money', 'Installment', 'Registration Fee', 'Service Charge', 'Rental Income', 'Others'],
    default: 'Others',
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Mobile Banking', 'Cheque', 'Others'],
    default: 'Cash',
  },
  amount: {
    type: Number,
    required: true,
  },
  remarks: String,
  category: {
    type: String,
    default: 'ClientUniversal',
  },
  subCategory: {
    type: String,
  },
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

projectIncomeSchema.index({ date: 1 });
projectIncomeSchema.index({ refName: 1 });

module.exports = mongoose.model('ProjectIncome', projectIncomeSchema, 'project-incomes');
