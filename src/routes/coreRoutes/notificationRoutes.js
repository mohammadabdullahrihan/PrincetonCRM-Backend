const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/coreControllers/notificationController');

// Get all notifications
router.get('/notification/list', notificationController.list);

// Get unread count
router.get('/notification/unread-count', notificationController.unreadCount);

// Mark as read
router.patch('/notification/:id/read', notificationController.markAsRead);

// Mark all as read
router.patch('/notification/mark-all-read', notificationController.markAllAsRead);

// Delete notification
router.delete('/notification/:id', notificationController.remove);

// Create notification (for testing)
router.post('/notification/create', notificationController.create);

module.exports = router;
