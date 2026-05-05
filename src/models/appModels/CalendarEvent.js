const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
  },
  allDay: {
    type: Boolean,
    default: false,
  },
  description: String,
  category: {
    type: String,
    enum: ['meeting', 'appointment', 'reminder', 'follow-up', 'visit'],
    default: 'meeting',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },
  relatedTo: {
    type: {
      type: String,
      enum: ['client', 'property', 'deal'],
    },
    id: mongoose.Schema.ObjectId,
    name: String,
  },
  attendees: [String],
  location: String,
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

calendarEventSchema.index({ start: 1 });
calendarEventSchema.index({ end: 1 });
calendarEventSchema.index({ category: 1 });
calendarEventSchema.index({ priority: 1 });
calendarEventSchema.index({ status: 1 });
calendarEventSchema.index({ createdBy: 1 });
calendarEventSchema.index({ removed: 1, enabled: 1 });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema, 'calendar-events');
