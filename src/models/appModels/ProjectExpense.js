const mongoose = require('mongoose');

const projectExpenseSchema = new mongoose.Schema({
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
  maintenance: {
    type: String,
    required: true,
  },
  expenseCategory: {
    type: String,
    enum: ['Office Rent', 'Salary', 'Utility Bill', 'Marketing', 'Maintenance', 'Travel', 'Others'],
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

projectExpenseSchema.index({ date: 1 });
projectExpenseSchema.index({ refName: 1 });

module.exports = mongoose.model('ProjectExpense', projectExpenseSchema, 'project-expenses');
