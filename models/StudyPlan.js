const mongoose = require('mongoose');

const StudyPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  topics: {
    type: [String],
    required: [true, 'Topics are required']
  },
  difficultyLevel: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  examDate: {
    type: Date,
    required: [true, 'Exam date is required']
  },
  availableHoursPerDay: {
    type: Number,
    required: [true, 'Available study hours per day is required']
  },
  planData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StudyPlan', StudyPlanSchema);
