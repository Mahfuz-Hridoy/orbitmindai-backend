const mongoose = require('mongoose');

const SummarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  originalText: {
    type: String,
    required: true
  },
  summaryText: {
    type: String,
    required: true
  },
  bulletPoints: {
    type: [String],
    default: []
  },
  keyConcepts: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Summary', SummarySchema);
