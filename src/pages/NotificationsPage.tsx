import { useState, useEffect } from 'react';
import {
    Bell, CheckCircle, Info, AlertTriangle, X,
    Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';

type Notification = {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    created_at: string;
    is_read: boolean;
    source: string;
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadNotifications() {
            try {
                const { data, error } = await supabase
                    .from('admin_notifications')
                    .select('id, title, message, type, source, is_read, created_at')
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (error) {
                    console.warn('admin_notifications query failed:', error);
                    return;
                }

                setNotifications((data || []).map(n => ({
                    ...n,
                    type: (n.type || 'info').toLowerCase() as Notification['type'],
                })));
            } catch (err) {
                console.error('Load notifications error:', err);
            } finally {
                setLoading(false);
            }
        }
        loadNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, is_read: true } : n
        ));
        await supabase.from('admin_notifications').update({ is_read: true }).eq('id', id);
    };

    const markAllAsRead = async () => {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length > 0) {
            await supabase.from('admin_notifications').update({ is_read: true }).in('id', unreadIds);
        }
    };

    const deleteNotification = async (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id));
        await supabase.from('admin_notifications').delete().eq('id', id);
    };

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => !n.is_read);

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

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>)}
            </div>
        );
    }

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
                    {notifications.some(n => !n.is_read) && (
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
                            className={`relative group p-4 rounded-xl border transition-all duration-200 ${notification.is_read
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
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {notification.title}
                                        </h4>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(notification.created_at)}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-2 font-medium">{notification.source}</p>
                                </div>
                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!notification.is_read && (
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
