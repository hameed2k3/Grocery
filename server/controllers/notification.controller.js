const Notification = require('../models/Notification');
const { asyncHandler, ApiError } = require('../middleware');

/**
 * @desc    Get my notifications
 * @route   GET /api/notifications
 * @access  Private
 */
const getMyNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user.id })
        .sort({ createdAt: -1 })
        .limit(20);

    const unreadCount = await Notification.countDocuments({
        recipient: req.user.id,
        read: false
    });

    res.status(200).json({
        success: true,
        data: {
            notifications,
            unreadCount
        }
    });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        throw new ApiError('Notification not found', 404);
    }

    if (notification.recipient.toString() !== req.user.id) {
        throw new ApiError('Not authorized', 403);
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
        success: true,
        message: 'Marked as read'
    });
});

/**
 * @desc    Mark all as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user.id, read: false },
        { $set: { read: true } }
    );

    res.status(200).json({
        success: true,
        message: 'All marked as read'
    });
});

module.exports = {
    getMyNotifications,
    markAsRead,
    markAllAsRead
};
