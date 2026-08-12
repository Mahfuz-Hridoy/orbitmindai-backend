const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, clearReadNotifications } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // Protect notification routes

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/clear-read', clearReadNotifications);

module.exports = router;
