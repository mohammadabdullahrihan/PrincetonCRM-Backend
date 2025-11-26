const mongoose = require('mongoose');

const visitedClientSchema = new mongoose.Schema({
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
    default: 'ClientUniversal',
  },
  subCategory: {
    type: String,
    default: 'client-visited',
  },
  
  // Fields from clientVisitedFields
  slNo: String,
  date: Date,
  refNo: String,
  refName: String,
  name: String,
  number: String,
  budget: String,
  visitedLocation: String,
  whoVisited: String,
  
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
visitedClientSchema.index({ name: 1 });
visitedClientSchema.index({ number: 1 });
visitedClientSchema.index({ createdBy: 1 });
visitedClientSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('VisitedClient', visitedClientSchema);
