const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // Protect chat history and messaging

router.post('/message', sendMessage);
router.get('/history', getChatHistory);

module.exports = router;
