const Notification = require('../../models/coreModels/Notification');

const notificationController = {
  // Get all notifications for logged-in user
  list: async (req, res) => {
    try {
      const userId = req.admin._id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const notifications = await Notification.find({ 
        user: userId,
        enabled: true 
      })
        .populate('createdBy', 'name surname email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Notification.countDocuments({ 
        user: userId,
        enabled: true 
      });

      const unreadCount = await Notification.countDocuments({
        user: userId,
        read: false,
        enabled: true
      });

      res.json({
        success: true,
        result: notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get unread count only
  unreadCount: async (req, res) => {
    try {
      const userId = req.admin._id;
      const count = await Notification.countDocuments({
        user: userId,
        read: false,
        enabled: true
      });

      res.json({
        success: true,
        count
      });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Mark single notification as read
  markAsRead: async (req, res) => {
    try {
      const userId = req.admin._id;
      const notificationId = req.params.id;

      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { read: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
      }

      res.json({
        success: true,
        result: notification
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (req, res) => {
    try {
      const userId = req.admin._id;

      const result = await Notification.updateMany(
        { user: userId, read: false, enabled: true },
        { read: true }
      );

      res.json({
        success: true,
        message: 'All notifications marked as read',
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Delete notification (soft delete)
  remove: async (req, res) => {
    try {
      const userId = req.admin._id;
      const notificationId = req.params.id;

      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { enabled: false },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
      }

      res.json({
        success: true,
        message: 'Notification deleted'
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Create notification (for testing or admin use)
  create: async (req, res) => {
    try {
      const { userId, type, title, message, link, metadata } = req.body;

      const notification = await Notification.create({
        user: userId || req.admin._id,
        type: type || 'info',
        title,
        message,
        link,
        createdBy: req.admin._id,
        metadata: metadata || {}
      });

      res.json({
        success: true,
        result: notification
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = notificationController;
