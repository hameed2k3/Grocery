import React, { useState, useEffect, useRef } from 'react';
import { notificationAPI } from '../../services/api';
import toast from 'react-hot-toast';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await notificationAPI.getAll();
            setNotifications(response.data.data.notifications);
            setUnreadCount(response.data.data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            // Optimistic update
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Notifications"
            >
                <span className="material-symbols-outlined text-2xl">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-fadeIn">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-750">
                        <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-primary font-medium hover:underline"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">notifications_off</span>
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {notifications.map(notification => (
                                    <div
                                        key={notification._id}
                                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${!notification.read ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                                            <div className="flex-1">
                                                <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                    {notification.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                                                <p className="text-[10px] text-gray-400 mt-2">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification._id)}
                                                    className="self-start text-gray-400 hover:text-blue-600 p-1"
                                                    title="Mark as read"
                                                >
                                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
