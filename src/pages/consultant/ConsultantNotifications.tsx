import { useState } from 'react';
import { Send, CheckCircle, AlertTriangle, Info, Clock, User } from 'lucide-react';

export default function ConsultantNotifications() {
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
    const [composeOpen, setComposeOpen] = useState(false);

    // Mock Assignments (In a real app, this would come from user context/API)
    const ASSIGNED_PROJECTS = ['ICT Center Construction', 'Solar Mini-Grid Installation'];
    const ASSIGNED_CONTRACTORS = ['BuildRight Ltd', 'GreenEnergy Solutions'];

    // Mock data with context
    const allNotifications = [
        { id: 1, type: 'alert', message: 'Project "ICT Center Construction" is behind schedule by 5 days.', project: 'ICT Center Construction', from: 'System', time: '2h ago', read: false },
        { id: 2, type: 'info', message: 'New submission received from BuildRight Ltd.', contractor: 'BuildRight Ltd', from: 'Contractor', time: '4h ago', read: true },
        { id: 3, type: 'success', message: 'Disbursement request approved by PTDF Admin.', project: 'Solar Mini-Grid Installation', from: 'Admin', time: '1d ago', read: true },
        // General Admin Message (Should be visible now)
        { id: 6, type: 'info', message: 'System maintenance scheduled for this weekend.', from: 'Admin', time: '3h ago', read: false },
        // Irrelevant notification (should be filtered out)
        { id: 4, type: 'alert', message: 'Critical issue at "Road Network Expansion".', project: 'Road Network Expansion', from: 'System', time: '1d ago', read: false },
        { id: 5, type: 'info', message: 'Message from unknown contractor.', contractor: 'Unknown Corp', from: 'Contractor', time: '2d ago', read: true },
    ];

    const allSentMessages = [
        { id: 101, to: 'BuildRight Ltd', contractor: 'BuildRight Ltd', subject: 'Correction Required', time: '1d ago', status: 'Read' },
        { id: 102, to: 'GreenEnergy Solutions', contractor: 'GreenEnergy Solutions', subject: 'Meeting Reminder', time: '2d ago', status: 'Unread' },
        // Irrelevant message
        { id: 103, to: 'Other Corp', contractor: 'Other Corp', subject: 'Inquiry', time: '1w ago', status: 'Read' },
    ];

    // Filter Logic
    const notifications = allNotifications.filter(n => {
        // ALWAYS allow Admin or System messages (as requested)
        if (n.from === 'Admin' || n.from === 'System') return true;

        // If it's project specific, check if assigned
        if (n.project && !ASSIGNED_PROJECTS.includes(n.project)) return false;
        // If it's contractor specific, check if assigned
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
                    <h1 className="text-2xl font-bold text-gray-900">Notifications & Messages</h1>
                    <p className="text-gray-500 text-sm">Stay updated on your assigned projects ({ASSIGNED_PROJECTS.length}) and contractors ({ASSIGNED_CONTRACTORS.length}).</p>
                </div>
                <button
                    onClick={() => setComposeOpen(!composeOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Send className="h-4 w-4" /> Send Message
                </button>
            </div>

            {/* Compose Area - Toggleable */}
            {composeOpen && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-slide-down">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">New Message</h3>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Recipient</label>
                            <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                <option>Select Contractor...</option>
                                {ASSIGNED_CONTRACTORS.map(c => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Subject</label>
                            <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Message</label>
                            <textarea rows={4} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setComposeOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                                Send Notification
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('received')}
                        className={`flex-1 py-3 text-sm font-medium text-center border-b-2 ${activeTab === 'received' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Received ({notifications.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`flex-1 py-3 text-sm font-medium text-center border-b-2 ${activeTab === 'sent' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Sent History ({sentMessages.length})
                    </button>
                </div>

                <div className="divide-y divide-gray-100">
                    {activeTab === 'received' ? (
                        notifications.length > 0 ? (
                            notifications.map(item => (
                                <div key={item.id} className={`p-4 flex gap-4 hover:bg-gray-50 transition-colors ${!item.read ? 'bg-indigo-50/50' : ''}`}>
                                    <div className={`p-2 rounded-full h-fit flex-shrink-0 ${item.type === 'alert' ? 'bg-red-100 text-red-600' :
                                        item.type === 'success' ? 'bg-green-100 text-green-600' :
                                            'bg-blue-100 text-blue-600'
                                        }`}>
                                        {item.type === 'alert' ? <AlertTriangle className="h-5 w-5" /> :
                                            item.type === 'success' ? <CheckCircle className="h-5 w-5" /> :
                                                <Info className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{item.message}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            <span className="flex items-center"><User className="h-3 w-3 mr-1" /> {item.from}</span>
                                            <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {item.time}</span>
                                        </div>
                                    </div>
                                    {!item.read && <span className="h-2 w-2 rounded-full bg-indigo-500 mt-2"></span>}
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                No new notifications.
                            </div>
                        )
                    ) : (
                        sentMessages.length > 0 ? (
                            sentMessages.map(item => (
                                <div key={item.id} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors">
                                    <div className="p-2 rounded-full h-fit bg-gray-100 text-gray-500">
                                        <Send className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{item.subject}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">To: {item.to}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {item.time}</span>
                                            <span className="bg-gray-100 px-1.5 py-0.5 rounded">{item.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                No sent messages.
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
