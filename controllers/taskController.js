const Task = require('../models/Task');
const Notification = require('../models/Notification');

// @desc    Get all user tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { q, category, completed, sortBy } = req.query;
    
    // Build query object
    const query = { userId: req.user.id };
    
    // Title/Description Search
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Category Filter
    if (category) {
      query.category = category;
    }
    
    // Completion Status Filter
    if (completed !== undefined) {
      query.isCompleted = completed === 'true';
    }

    // Sorting
    let sortObj = { deadline: 1 }; // default sorting: deadline ascending
    if (sortBy) {
      const [field, order] = sortBy.split(':');
      sortObj = { [field]: order === 'desc' ? -1 : 1 };
    }

    const tasks = await Task.find(query).sort(sortObj);
    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching tasks' });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, deadline, priority, category, estimatedHours } = req.body;

    if (!title || !deadline || !category) {
      return res.status(400).json({ success: false, message: 'Title, deadline, and category are required' });
    }

    const task = await Task.create({
      userId: req.user.id,
      title,
      description,
      deadline,
      priority,
      category,
      estimatedHours
    });

    // Auto-create a deadline notification if deadline is within 48 hours
    const timeDiff = new Date(deadline) - new Date();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    if (hoursDiff > 0 && hoursDiff <= 48) {
      await Notification.create({
        userId: req.user.id,
        title: 'Urgent Task Deadline',
        message: `"${title}" (${category}) is due within 48 hours (on ${new Date(deadline).toLocaleString()})!`,
        type: 'deadline'
      });
    }

    res.status(201).json({ success: true, task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, message: 'Server error creating task' });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, deadline, priority, category, estimatedHours, isCompleted } = req.body;
    
    let task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found or unauthorized' });
    }

    // Update fields if provided
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (deadline !== undefined) task.deadline = deadline;
    if (priority !== undefined) task.priority = priority;
    if (category !== undefined) task.category = category;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    
    // Toggle completion and trigger completed notification if toggled to true
    if (isCompleted !== undefined) {
      const wasCompleted = task.isCompleted;
      task.isCompleted = isCompleted;

      if (isCompleted && !wasCompleted) {
        await Notification.create({
          userId: req.user.id,
          title: 'Task Completed!',
          message: `Great job! You completed: "${task.title}". Keep it up!`,
          type: 'task'
        });
      }
    }

    await task.save();

    // Check updated deadline notifications
    if (deadline !== undefined) {
      const timeDiff = new Date(deadline) - new Date();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      if (hoursDiff > 0 && hoursDiff <= 48) {
        await Notification.create({
          userId: req.user.id,
          title: 'Urgent Task Deadline Updated',
          message: `"${task.title}" is due soon on ${new Date(deadline).toLocaleString()}.`,
          type: 'deadline'
        });
      }
    }

    res.json({ success: true, task });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ success: false, message: 'Server error updating task' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const result = await Task.deleteOne({ _id: req.params.id, userId: req.user.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Task not found or unauthorized' });
    }
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting task' });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
