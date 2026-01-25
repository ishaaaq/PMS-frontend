import { useState } from 'react';
import { Send, CheckCircle, AlertTriangle, Info, Clock, User } from 'lucide-react';

export default function ConsultantNotifications() {
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
    const [composeOpen, setComposeOpen] = useState(false);

    // Mock Assignments
    const ASSIGNED_PROJECTS = ['ICT Center Construction', 'Solar Mini-Grid Installation'];
    const ASSIGNED_CONTRACTORS = ['BuildRight Ltd', 'GreenEnergy Solutions'];

    // Mock data with context
    const allNotifications = [
        { id: 1, type: 'alert', message: 'Project "ICT Center Construction" is behind schedule by 5 days.', project: 'ICT Center Construction', from: 'System', time: '2h ago', read: false },
        { id: 2, type: 'info', message: 'New submission received from BuildRight Ltd.', contractor: 'BuildRight Ltd', from: 'Contractor', time: '4h ago', read: true },
        { id: 3, type: 'success', message: 'Disbursement request approved by PTDF Admin.', project: 'Solar Mini-Grid Installation', from: 'Admin', time: '1d ago', read: true },
        { id: 6, type: 'info', message: 'System maintenance scheduled for this weekend.', from: 'Admin', time: '3h ago', read: false },
        { id: 4, type: 'alert', message: 'Critical issue at "Road Network Expansion".', project: 'Road Network Expansion', from: 'System', time: '1d ago', read: false },
        { id: 5, type: 'info', message: 'Message from unknown contractor.', contractor: 'Unknown Corp', from: 'Contractor', time: '2d ago', read: true },
    ];

    const allSentMessages = [
        { id: 101, to: 'BuildRight Ltd', contractor: 'BuildRight Ltd', subject: 'Correction Required', time: '1d ago', status: 'Read' },
        { id: 102, to: 'GreenEnergy Solutions', contractor: 'GreenEnergy Solutions', subject: 'Meeting Reminder', time: '2d ago', status: 'Unread' },
        { id: 103, to: 'Other Corp', contractor: 'Other Corp', subject: 'Inquiry', time: '1w ago', status: 'Read' },
    ];

    // Filter Logic
    const notifications = allNotifications.filter(n => {
        if (n.from === 'Admin' || n.from === 'System') return true;
        if (n.project && !ASSIGNED_PROJECTS.includes(n.project)) return false;
        if (n.contractor && !ASSIGNED_CONTRACTORS.includes(n.contractor)) return false;
        return true;
    });

    const sentMessages = allSentMessages.filter(m => {
        if (m.contractor && !ASSIGNED_CONTRACTORS.includes(m.contractor)) return false;
        return true;
    });

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications & Messages</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Stay updated on your assigned projects ({ASSIGNED_PROJECTS.length}) and contractors ({ASSIGNED_CONTRACTORS.length}).</p>
                </div>
                <button
                    onClick={() => setComposeOpen(!composeOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none font-medium text-sm"
                >
                    <Send className="h-4 w-4" /> Send Message
                </button>
            </div>

            {/* Compose Area - Toggleable */}
            {composeOpen && (
                <div className="glass-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-slide-down">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">New Message</h3>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipient</label>
                            <select className="block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm p-2.5">
                                <option>Select Contractor...</option>
                                {ASSIGNED_CONTRACTORS.map(c => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                            <input type="text" className="block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm p-2.5" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                            <textarea rows={4} className="block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm p-2.5"></textarea>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setComposeOpen(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                                Send Notification
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="glass-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('received')}
                        className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'received' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        Received ({notifications.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'sent' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        Sent History ({sentMessages.length})
                    </button>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {activeTab === 'received' ? (
                        notifications.length > 0 ? (
                            notifications.map(item => (
                                <div key={item.id} className={`p-4 flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!item.read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                                    <div className={`p-2 rounded-full h-fit flex-shrink-0 ${item.type === 'alert' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                                        item.type === 'success' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                                            'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                        }`}>
                                        {item.type === 'alert' ? <AlertTriangle className="h-5 w-5" /> :
                                            item.type === 'success' ? <CheckCircle className="h-5 w-5" /> :
                                                <Info className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.message}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center"><User className="h-3 w-3 mr-1" /> {item.from}</span>
                                            <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {item.time}</span>
                                        </div>
                                    </div>
                                    {!item.read && <span className="h-2 w-2 rounded-full bg-indigo-500 mt-2"></span>}
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                No new notifications.
                            </div>
                        )
                    ) : (
                        sentMessages.length > 0 ? (
                            sentMessages.map(item => (
                                <div key={item.id} className="p-4 flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="p-2 rounded-full h-fit bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                        <Send className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.subject}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">To: {item.to}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {item.time}</span>
                                            <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{item.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                No sent messages.
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
