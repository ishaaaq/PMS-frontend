
import { useState } from 'react';
import { Bell, X, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import type { Contractor } from '../../services/contractors';

interface SendNotificationModalProps {
    contractor: Contractor;
    onClose: () => void;
    onSend: (data: { contractorId: string; type: string; subject: string; message: string }) => void;
}

const notificationTypes = [
    { id: 'info', label: 'Information', icon: Info, color: 'text-blue-600 bg-blue-100' },
    { id: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-100' },
    { id: 'action', label: 'Action Required', icon: AlertCircle, color: 'text-red-600 bg-red-100' },
];

export default function SendNotificationModal({ contractor, onClose, onSend }: SendNotificationModalProps) {
    const [type, setType] = useState('info');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSend({
            contractorId: contractor.id,
            type,
            subject,
            message
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button type="button" className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none" onClick={onClose}>
                            <span className="sr-only">Close</span>
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
                            <Bell className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                Send Notification
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 mb-4">
                                    Sending to: <span className="font-semibold">{contractor.name}</span>
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Notification Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Notification Type</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {notificationTypes.map((t) => (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => setType(t.id)}
                                                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center ${type === t.id
                                                            ? 'border-purple-500 bg-purple-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className={`p-1.5 rounded-full ${t.color}`}>
                                                        <t.icon className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-xs font-medium mt-1">{t.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Subject</label>
                                        <input
                                            type="text"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="mt-1 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm border border-gray-300 rounded-md p-2"
                                            placeholder="Enter notification subject..."
                                            required
                                        />
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Message</label>
                                        <textarea
                                            rows={4}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            className="mt-1 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm border border-gray-300 rounded-md p-2"
                                            placeholder="Enter your message..."
                                            required
                                        />
                                    </div>

                                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="submit"
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                                        >
                                            Send Notification
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                                            onClick={onClose}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
