const ChatHistory = require('../models/ChatHistory');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { generateJSONContent } = require('../services/geminiService');
const { getSystemChatPrompt } = require('../utils/prompts');

// @desc    Send user message & get AI response
// @route   POST /api/chat/message
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Get or create ChatHistory
    let chatHistory = await ChatHistory.findOne({ userId: req.user.id });
    if (!chatHistory) {
      chatHistory = await ChatHistory.create({ userId: req.user.id, messages: [] });
    }

    // Get rolling context of last 10 messages
    const recentMessages = chatHistory.messages.slice(-10);
    const contextString = recentMessages.map(m => `${m.sender}: ${m.message}`).join('\n');

    const currentDateStr = new Date().toISOString().split('T')[0];
    const systemInstruction = getSystemChatPrompt(currentDateStr);
    
    const userPrompt = `Conversation history:\n${contextString}\n\nUser message: ${message}`;
    
    // Call Gemini
    const aiOutput = await generateJSONContent(systemInstruction, userPrompt);
    
    let aiReply = aiOutput.reply;
    let autoCreatedTask = null;

    // Check if task needs to be created
    if (aiOutput.taskToCreate) {
      try {
        const taskData = aiOutput.taskToCreate;
        autoCreatedTask = await Task.create({
          userId: req.user.id,
          title: taskData.title,
          description: taskData.description || 'Created automatically from chat conversation.',
          deadline: new Date(taskData.deadline),
          priority: taskData.priority || 'medium',
          category: taskData.category || 'study',
          estimatedHours: taskData.estimatedHours || 1
        });

        // Add notice to reply
        aiReply += `\n\n[Auto-Task] I've scheduled "${taskData.title}" (${taskData.category}) due on ${new Date(taskData.deadline).toLocaleDateString()} in your study plan.`;

        // Create alert notification
        await Notification.create({
          userId: req.user.id,
          title: 'Task Created via Chat',
          message: `Scheduled task: "${taskData.title}" from your chat request.`,
          type: 'task'
        });
      } catch (err) {
        console.error('Error creating auto-task from chat:', err);
      }
    }

    // Save messages to database
    chatHistory.messages.push({ sender: 'user', message: message });
    chatHistory.messages.push({ sender: 'ai', message: aiReply });
    chatHistory.updatedAt = Date.now();
    await chatHistory.save();

    res.json({
      success: true,
      reply: aiReply,
      autoCreatedTask,
      messages: chatHistory.messages
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, message: 'Server error in AI chat' });
  }
};

// @desc    Get chat history
// @route   GET /api/chat/history
// @access  Private
const getChatHistory = async (req, res) => {
  try {
    let chatHistory = await ChatHistory.findOne({ userId: req.user.id });
    if (!chatHistory) {
      chatHistory = await ChatHistory.create({ userId: req.user.id, messages: [] });
    }
    res.json({ success: true, messages: chatHistory.messages });
  } catch (error) {
    console.error('Fetch chat history error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching chat history' });
  }
};

module.exports = {
  sendMessage,
  getChatHistory
};
