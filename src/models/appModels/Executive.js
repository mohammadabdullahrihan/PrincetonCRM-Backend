const mongoose = require('mongoose');

const executiveSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  sl: String,
  name: String,
  number: String,
  reference: String,
  address: String,
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

executiveSchema.index({ name: 1 });
executiveSchema.index({ createdBy: 1 });
executiveSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('Executive', executiveSchema);
