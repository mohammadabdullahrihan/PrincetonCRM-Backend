const mongoose = require('mongoose');

const developerSchema = new mongoose.Schema({
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
  designation: String,
  number: String,
  companyName: String,
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

developerSchema.index({ name: 1 });
developerSchema.index({ companyName: 1 });
developerSchema.index({ createdBy: 1 });
developerSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('Developer', developerSchema);
