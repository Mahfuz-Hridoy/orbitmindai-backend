const StudyPlan = require('../models/StudyPlan');
const Notification = require('../models/Notification');
const { generateJSONContent } = require('../services/geminiService');
const { getStudyPlanPrompt } = require('../utils/prompts');

// @desc    Generate and save a study plan
// @route   POST /api/studyplans/generate
// @access  Private
const generateStudyPlan = async (req, res) => {
  try {
    const { subject, topics, difficultyLevel, examDate, availableHoursPerDay } = req.body;

    if (!subject || !topics || !difficultyLevel || !examDate || !availableHoursPerDay) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const prompt = getStudyPlanPrompt(subject, topics, difficultyLevel, examDate, availableHoursPerDay);
    const systemInstruction = 'You are an academic study planner. Output plan details in valid JSON ONLY.';

    // Generate content using Gemini service
    const planData = await generateJSONContent(systemInstruction, prompt);

    // Save to Database
    const studyPlan = await StudyPlan.create({
      userId: req.user.id,
      subject,
      topics,
      difficultyLevel,
      examDate,
      availableHoursPerDay,
      planData
    });

    // Create a notification for new study plan
    await Notification.create({
      userId: req.user.id,
      title: 'New Study Plan Generated!',
      message: `Your AI study roadmap for "${subject}" has been successfully prepared. Check it out now!`,
      type: 'ai_alert'
    });

    res.status(201).json({ success: true, studyPlan });
  } catch (error) {
    console.error('Study plan generation error:', error);
    res.status(500).json({ success: false, message: 'Server error generating study plan' });
  }
};

// @desc    Get all study plans for a user
// @route   GET /api/studyplans
// @access  Private
const getStudyPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: plans.length, plans });
  } catch (error) {
    console.error('Fetch study plans error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching study plans' });
  }
};

// @desc    Get study plan by ID
// @route   GET /api/studyplans/:id
// @access  Private
const getStudyPlanById = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.user.id });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Study plan not found' });
    }
    res.json({ success: true, plan });
  } catch (error) {
    console.error('Fetch study plan by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching study plan details' });
  }
};

// @desc    Delete a study plan
// @route   DELETE /api/studyplans/:id
// @access  Private
const deleteStudyPlan = async (req, res) => {
  try {
    const result = await StudyPlan.deleteOne({ _id: req.params.id, userId: req.user.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Study plan not found or unauthorized' });
    }
    res.json({ success: true, message: 'Study plan deleted successfully' });
  } catch (error) {
    console.error('Delete study plan error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting study plan' });
  }
};

module.exports = {
  generateStudyPlan,
  getStudyPlans,
  getStudyPlanById,
  deleteStudyPlan
};
