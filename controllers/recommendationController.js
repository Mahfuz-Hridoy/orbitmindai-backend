const Task = require('../models/Task');
const { generateJSONContent } = require('../services/geminiService');
const { getProductivityAuditPrompt } = require('../utils/prompts');

// @desc    Get AI-driven productivity recommendations and analysis
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
  try {
    // Fetch user tasks
    const tasks = await Task.find({ userId: req.user.id });

    // If there are no tasks, return an empty/optimal state immediately
    if (tasks.length === 0) {
      return res.json({
        success: true,
        data: {
          productivityScore: 100,
          burnoutLevel: 'low',
          burnoutWarning: 'Your board is clear! Excellent organization. Ready to start scheduling new tasks when you are.',
          priorityAlerts: ['No pending tasks.'],
          recommendations: ['Add some academic tasks or goals to generate personalized productivity tips.']
        }
      });
    }

    // Prepare a clean list of tasks to keep token usage small
    const cleanTasks = tasks.map(t => ({
      title: t.title,
      deadline: t.deadline.toISOString().split('T')[0],
      priority: t.priority,
      category: t.category,
      estimatedHours: t.estimatedHours,
      isCompleted: t.isCompleted
    }));

    const currentDateStr = new Date().toISOString().split('T')[0];
    const prompt = getProductivityAuditPrompt(cleanTasks, currentDateStr);
    const systemInstruction = 'You are a student productivity advisor. Analyze the task log and output diagnostic details in valid JSON ONLY.';

    // Generate diagnostic data
    const auditData = await generateJSONContent(systemInstruction, prompt);

    res.json({
      success: true,
      data: auditData
    });
  } catch (error) {
    console.error('Workload audit recommendations error:', error);
    res.status(500).json({ success: false, message: 'Server error generating productivity analysis' });
  }
};

module.exports = {
  getRecommendations
};
