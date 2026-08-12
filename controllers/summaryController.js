const Summary = require('../models/Summary');
const { generateJSONContent } = require('../services/geminiService');
const { getSummaryPrompt } = require('../utils/prompts');

// @desc    Generate and save a note summary
// @route   POST /api/summaries/summarize
// @access  Private
const generateSummary = async (req, res) => {
  try {
    const { notesText } = req.body;

    if (!notesText || notesText.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Please enter notes text to summarize' });
    }

    const prompt = getSummaryPrompt(notesText);
    const systemInstruction = 'You are an academic summarizer. Output note summaries in valid JSON ONLY.';

    // Call Gemini
    const parsedSummary = await generateJSONContent(systemInstruction, prompt);

    // Save to DB
    const summary = await Summary.create({
      userId: req.user.id,
      title: parsedSummary.title || 'Untitled Summary',
      originalText: notesText,
      summaryText: parsedSummary.summary,
      bulletPoints: parsedSummary.bulletPoints || [],
      keyConcepts: parsedSummary.keyConcepts || []
    });

    res.status(201).json({ success: true, summary });
  } catch (error) {
    console.error('Note summarization error:', error);
    res.status(500).json({ success: false, message: 'Server error generating summary' });
  }
};

// @desc    Get all note summaries for a user
// @route   GET /api/summaries
// @access  Private
const getSummaries = async (req, res) => {
  try {
    const summaries = await Summary.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: summaries.length, summaries });
  } catch (error) {
    console.error('Fetch summaries error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching summaries' });
  }
};

// @desc    Delete a summary
// @route   DELETE /api/summaries/:id
// @access  Private
const deleteSummary = async (req, res) => {
  try {
    const result = await Summary.deleteOne({ _id: req.params.id, userId: req.user.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Summary not found or unauthorized' });
    }
    res.json({ success: true, message: 'Summary deleted successfully' });
  } catch (error) {
    console.error('Delete summary error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting summary' });
  }
};

module.exports = {
  generateSummary,
  getSummaries,
  deleteSummary
};
