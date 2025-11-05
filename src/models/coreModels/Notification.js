const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'project', 'task', 'message', 'payment', 'client'],
    default: 'info'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String,
    default: null
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  enabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for faster queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, enabled: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
