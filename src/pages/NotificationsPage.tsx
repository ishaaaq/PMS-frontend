import { useState } from 'react';
import {
    Bell, CheckCircle, Info, AlertTriangle, X,
    Check
} from 'lucide-react';

type Notification = {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    time: string;
    isRead: boolean;
    source: string;
};

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        title: 'Project Milestone Completed',
        message: 'The "Foundation Phase" for Lagos-Ibadan Expressway Section B has been marked as complete by Julius Berger.',
        type: 'success',
        time: 'Just now',
        isRead: false,
        source: 'Project Update'
    },
    {
        id: '2',
        title: 'Budget Alert',
        message: 'Project "Abuja Solar Farm" has reached 85% of its allocated budget usage.',
        type: 'warning',
        time: '2 hours ago',
        isRead: false,
        source: 'Financial System'
    },
    {
        id: '3',
        title: 'New Contractor Registration',
        message: 'Dangote Construction Ltd has submitted a new registration application requiring review.',
        type: 'info',
        time: '5 hours ago',
        isRead: true,
        source: 'Admin'
    },
    {
        id: '4',
        title: 'Report Generated',
        message: 'The Monthly Disbursement Report for December 2025 is ready for download.',
        type: 'info',
        time: 'Yesterday',
        isRead: true,
        source: 'System'
    },
    {
        id: '5',
        title: 'System Maintenance Scheduled',
        message: 'The platform will undergo scheduled maintenance on Saturday, Jan 30th from 2:00 AM to 4:00 AM.',
        type: 'info',
        time: '2 days ago',
        isRead: true,
        source: 'System Announcement'
    }
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, isRead: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => !n.isRead);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30';
            case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-900/30';
            case 'error': return 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30';
            default: return 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Stay updated with activity across your projects</p>
                </div>
                <div className="flex gap-3">
                    <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'all'
                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'unread'
                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Unread
                        </button>
                    </div>
                    {notifications.some(n => !n.isRead) && (
                        <button
                            onClick={markAllAsRead}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-ptdf-primary hover:bg-ptdf-secondary transition-all"
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Mark all as read
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No notifications</h3>
                        <p className="text-gray-500 dark:text-gray-400">You're all caught up!</p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`relative group p-4 rounded-xl border transition-all duration-200 ${notification.isRead
                                    ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                                    : 'bg-white dark:bg-gray-800 border-l-4 border-l-ptdf-primary shadow-sm border-y-gray-100 border-r-gray-100 dark:border-y-gray-700 dark:border-r-gray-700'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-full flex-shrink-0 ${getBgColor(notification.type)}`}>
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className={`text-sm font-semibold ${notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}>
                                            {notification.title}
                                        </h4>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">{notification.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-2 font-medium">{notification.source}</p>
                                </div>
                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="p-1 text-gray-400 hover:text-ptdf-primary transition-colors"
                                            title="Mark as read"
                                        >
                                            <div className="h-2 w-2 rounded-full bg-ptdf-primary" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Dismiss"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
