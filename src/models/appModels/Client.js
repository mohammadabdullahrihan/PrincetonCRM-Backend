const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },

  name: {
    type: String,
    required: true,
  },
  phone: String,
  country: String,
  address: String,
  email: String,
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  assigned: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

schema.plugin(require('mongoose-autopopulate'));

// Add indexes for better performance
schema.index({ name: 1 });
schema.index({ email: 1 });
schema.index({ phone: 1 });
schema.index({ country: 1 });
schema.index({ createdBy: 1 });
schema.index({ assigned: 1 });
schema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('Client', schema);
