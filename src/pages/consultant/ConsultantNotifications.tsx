import { useState } from 'react';
import { Send, CheckCircle, AlertTriangle, Info, Clock, User } from 'lucide-react';

export default function ConsultantNotifications() {
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
    const [composeOpen, setComposeOpen] = useState(false);

    // Mock data
    const notifications = [
        { id: 1, type: 'alert', message: 'Project "ICT Center" is behind schedule by 5 days.', from: 'System', time: '2h ago', read: false },
        { id: 2, type: 'info', message: 'New submission received from BuildRight Ltd.', from: 'Contractor', time: '4h ago', read: true },
        { id: 3, type: 'success', message: 'Disbursement request approved by PTDF Admin.', from: 'Admin', time: '1d ago', read: true },
    ];

    const sentMessages = [
        { id: 101, to: 'BuildRight Ltd', subject: 'Correction Required', time: '1d ago', status: 'Read' },
        { id: 102, to: 'GreenEnergy Solutions', subject: 'Meeting Reminder', time: '2d ago', status: 'Unread' },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications & Messages</h1>
                    <p className="text-gray-500 text-sm">Stay updated and communicate with contractors.</p>
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
                                <option>BuildRight Construction Ltd</option>
                                <option>GreenEnergy Solutions</option>
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
                        Received
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`flex-1 py-3 text-sm font-medium text-center border-b-2 ${activeTab === 'sent' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Sent History
                    </button>
                </div>

                <div className="divide-y divide-gray-100">
                    {activeTab === 'received' ? (
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
                    )}
                </div>
            </div>
        </div>
    );
}
