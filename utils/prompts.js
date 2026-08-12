const getSystemChatPrompt = (currentDateStr) => {
  return `You are OrbitMind Coach, a supportive and highly intelligent AI productivity and academic assistant for students.
Your goals:
1. Answer academic questions, suggest study methods, recommend productivity hacks (like Pomodoro, active recall), and provide encouragement.
2. Detect if the user wants to add, schedule, or create a task (e.g., "Add a task to study for math test tomorrow", "I need to submit my physics report on Monday", "Create an assignment due next Friday").
3. If they want to create a task, extract the details (title, description, deadline, priority, category, estimated hours).
4. Always respond in JSON format with the following structure:
{
  "reply": "Your friendly text message to the student.",
  "taskToCreate": { // Provide this object ONLY if you detect the user wants to add/create a task
    "title": "Title of the task",
    "description": "Optional brief description",
    "deadline": "YYYY-MM-DD format (Calculate relative to current date: ${currentDateStr})",
    "priority": "low" | "medium" | "high",
    "category": "study" | "assignment" | "exam" | "personal" | "project",
    "estimatedHours": 1 // number of estimated hours, guess reasonably if not specified
  }
}
If no task is being added, do not include the "taskToCreate" field. Always make sure your JSON is valid.`;
};

const getStudyPlanPrompt = (subject, topics, difficultyLevel, examDate, availableHoursPerDay) => {
  return `Create a detailed, highly structured, student-friendly study plan.
Subject: ${subject}
Topics to cover: ${topics.join(', ')}
Difficulty: ${difficultyLevel}
Exam Date: ${examDate}
Available daily study hours: ${availableHoursPerDay} hours

Respond ONLY with a valid JSON object matching the following structure:
{
  "estimatedCompletionTime": "e.g., 2 weeks, 10 days",
  "weeklyRoadmap": [
    {
      "weekNumber": 1,
      "focus": "Overall weekly focus topic",
      "dailyTasks": [
        { "day": "Day 1", "task": "Specific daily study task", "hours": 2 },
        { "day": "Day 2", "task": "Specific daily study task", "hours": 2 }
      ]
    }
  ],
  "revisionSessions": [
    { "sessionName": "Revision Session 1", "focus": "What to review", "recommendedHours": 2 }
  ],
  "smartRecommendations": [
    "AI advice 1",
    "AI advice 2"
  ]
}`;
};

const getSummaryPrompt = (notesText) => {
  return `Summarize the following student notes. Extract key summaries, bullet points, and main concepts.
Notes:
"""
${notesText}
"""

Respond ONLY with a valid JSON object matching the following structure:
{
  "title": "Generated clean short title for the note",
  "summary": "Concise high-level summary paragraph",
  "bulletPoints": [
    "Key detailed point 1",
    "Key detailed point 2"
  ],
  "keyConcepts": [
    "Concept/Term 1",
    "Concept/Term 2"
  ]
}`;
};

const getProductivityAuditPrompt = (tasks, currentDateStr) => {
  return `Analyze this student's workload, pending tasks, and upcoming deadlines.
Current Date: ${currentDateStr}
Tasks:
${JSON.stringify(tasks, null, 2)}

Provide an audit assessing their current schedule and safety from burnout.
Respond ONLY with a valid JSON object matching this structure:
{
  "productivityScore": 85, // Calculate a score between 0 and 100 based on task completion and deadlines
  "burnoutLevel": "low" | "medium" | "high", // Assess risk based on workload vs estimated hours
  "burnoutWarning": "A friendly advice message detailing burnout risks or general encouragement.",
  "priorityAlerts": [
    "Urgent notification like: 'Assignment X is due in 12 hours!'"
  ],
  "recommendations": [
    "Actionable recommendation like: 'Focus on assignment Y today before starting project Z.'"
  ]
}`;
};

module.exports = {
  getSystemChatPrompt,
  getStudyPlanPrompt,
  getSummaryPrompt,
  getProductivityAuditPrompt
};
