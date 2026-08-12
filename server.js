const dns = require("dns");
dns.setServers(["8.8.8.8","8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first")

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');

// Initialize database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin:"https://mahfuz-hridoy.github.io"
}));
app.use(express.json());
app.use("/health",(req,res)=>{
  res.status(200).json({
    message: "healthy"
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/studyplans', require('./routes/studyPlanRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/summaries', require('./routes/summaryRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Serve static assets in production/development for ease of presentation
app.use(express.static(path.join(__dirname, '../frontend')));

// Fallback route for index.html if request is not an API
app.get('*', (req, res) => {
  // If it's an API route that wasn't matched, return 404
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
