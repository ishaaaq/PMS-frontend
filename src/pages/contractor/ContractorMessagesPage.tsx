import { useEffect, useState } from 'react';
import { getContractorNotifications } from '../../services/contractor';
import type { Notification, NotificationType } from '../../services/contractor';
import {
    Bell, AlertTriangle, CheckCircle, DollarSign, Info,
    Check, Inbox
} from 'lucide-react';

type FilterType = 'All' | NotificationType;

export default function ContractorMessagesPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterType>('All');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await getContractorNotifications();
                setNotifications(data);
            } catch (error) {
                console.error('Failed to load notifications', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const getNotificationConfig = (type: NotificationType) => {
        switch (type) {
            case 'QUERY': return {
                icon: AlertTriangle,
                bgColor: 'bg-red-50 dark:bg-red-900/10',
                borderColor: 'border-red-400 dark:border-red-500',
                iconColor: 'text-red-500 dark:text-red-400',
                label: 'Query',
                labelColor: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            };
            case 'PAYMENT': return {
                icon: DollarSign,
                bgColor: 'bg-green-50 dark:bg-green-900/10',
                borderColor: 'border-green-400 dark:border-green-500',
                iconColor: 'text-green-500 dark:text-green-400',
                label: 'Payment',
                labelColor: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            };
            case 'APPROVAL': return {
                icon: CheckCircle,
                bgColor: 'bg-blue-50 dark:bg-blue-900/10',
                borderColor: 'border-blue-400 dark:border-blue-500',
                iconColor: 'text-blue-500 dark:text-blue-400',
                label: 'Approval',
                labelColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
            };
            default: return {
                icon: Info,
                bgColor: 'bg-gray-50 dark:bg-gray-800/30',
                borderColor: 'border-gray-300 dark:border-gray-600',
                iconColor: 'text-gray-500 dark:text-gray-400',
                label: 'System',
                labelColor: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            };
        }
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
    };

    const handleMarkAsRead = (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, isRead: true } : n
        ));
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const filteredNotifications = notifications.filter(n =>
        activeFilter === 'All' || n.type === activeFilter
    );

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const filterTabs: { key: FilterType; label: string; count?: number }[] = [
        { key: 'All', label: 'All', count: notifications.length },
        { key: 'QUERY', label: 'Queries', count: notifications.filter(n => n.type === 'QUERY').length },
        { key: 'PAYMENT', label: 'Payments', count: notifications.filter(n => n.type === 'PAYMENT').length },
        { key: 'APPROVAL', label: 'Approvals', count: notifications.filter(n => n.type === 'APPROVAL').length },
        { key: 'SYSTEM', label: 'System', count: notifications.filter(n => n.type === 'SYSTEM').length },
    ];

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>)}
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                        <Bell className="h-6 w-6 mr-2 text-indigo-500" />
                        Notifications
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You\'re all caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                    >
                        <Check className="h-4 w-4 mr-1.5" />
                        Mark all as read
                    </button>
                )}
            </header>

            {/* Filter Tabs */}
            <div className="glass-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1.5 flex gap-1 overflow-x-auto">
                {filterTabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveFilter(tab.key)}
                        className={`flex-1 min-w-[80px] px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeFilter === tab.key
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeFilter === tab.key ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {filteredNotifications.map(n => {
                    const config = getNotificationConfig(n.type);
                    const Icon = config.icon;

                    return (
                        <div
                            key={n.id}
                            onClick={() => handleMarkAsRead(n.id)}
                            className={`${config.bgColor} border-l-4 ${config.borderColor} rounded-r-xl p-4 cursor-pointer transition-all hover:shadow-md ${!n.isRead ? 'ring-1 ring-indigo-200 dark:ring-indigo-700' : ''
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-full ${config.bgColor} flex-shrink-0`}>
                                    <Icon className={`h-5 w-5 ${config.iconColor}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className={`font-semibold ${!n.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {n.title}
                                        </h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${config.labelColor}`}>
                                            {config.label}
                                        </span>
                                        {!n.isRead && (
                                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{n.message}</p>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                        {n.projectTitle && (
                                            <span className="bg-white/50 dark:bg-white/10 px-2 py-0.5 rounded">{n.projectTitle}</span>
                                        )}
                                        <span>{formatDate(n.timestamp)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredNotifications.length === 0 && (
                <div className="glass-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <Inbox className="h-16 w-16 text-gray-200 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activeFilter === 'All'
                            ? 'You\'re all caught up! Check back later for updates.'
                            : `No ${activeFilter.toLowerCase()} notifications at the moment.`
                        }
                    </p>
                </div>
            )}
        </div>
    );
}
