const Notification = require("../models/Notification");

// @desc  Get logged-in user's notifications (most recent first)
// @route GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "name avatarColor")
      .populate("project", "name")
      .populate("task", "title")
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
  }
};

// @desc  Mark a single notification as read
// @route PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json({ notification });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification", error: error.message });
  }
};

// @desc  Mark all notifications as read
// @route PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notifications", error: error.message });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
