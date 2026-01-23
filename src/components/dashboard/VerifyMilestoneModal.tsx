import { useState } from 'react';
import {
    X,
    CheckCircle,
    AlertTriangle,
    MessageSquare,
    FileText,
    Download,
    Eye,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Calendar
} from 'lucide-react';

interface VerifyMilestoneModalProps {
    isOpen: boolean;
    onClose: () => void;
    submission: any; // Using any for mock, replace with Submission interface
}

export default function VerifyMilestoneModal({ isOpen, onClose, submission }: VerifyMilestoneModalProps) {
    const [status, setStatus] = useState<'pending' | 'approved' | 'queried'>('pending');
    const [feedback, setFeedback] = useState('');
    const [activeImage, setActiveImage] = useState(0);

    if (!isOpen || !submission) return null;

    // Mock submission data if not provided (for development/preview)
    const data = submission || {
        id: 'sub-123',
        milestone: 'Foundation Construction',
        contractor: 'BuildRight Construction Ltd',
        date: 'Oct 24, 2025',
        location: 'Lagos Main Site',
        description: 'Completed excavation and pouring of foundation concrete according to specifications.',
        images: [
            'https://images.unsplash.com/photo-1590644365607-1c5a2e9a3a70?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1590644365607-1c5a2e9a3a70?auto=format&fit=crop&w=800&q=80'
        ],
        documents: [
            { name: 'Material_Test_Result.pdf', size: '2.4 MB' },
            { name: 'Site_Inspection_Log.pdf', size: '1.2 MB' }
        ],
        materialUsage: [
            { item: 'Cement', quantity: '500 Bags', expected: '450-550 Bags' },
            { item: 'Steel Reinforcement', quantity: '2 Tons', expected: '2 Tons' }
        ]
    };

    const handleApprove = () => {
        setStatus('approved');
        // API call would go here
        setTimeout(() => onClose(), 1500);
    };

    const handleQuery = () => {
        setStatus('queried');
        // API call would go here
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">

                    {/* Header */}
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <FileText className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Verify Submission
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {data.milestone} • {data.contractor}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row h-[70vh]">

                        {/* Left Side: Evidence Viewer */}
                        <div className="w-full md:w-2/3 bg-gray-900 flex flex-col relative">
                            {/* Main Image */}
                            <div className="flex-1 flex items-center justify-center overflow-hidden relative group">
                                <img
                                    src={data.images[activeImage]}
                                    alt="Evidence"
                                    className="max-h-full max-w-full object-contain"
                                />

                                {/* Navigation Arrows */}
                                <button
                                    onClick={() => setActiveImage(prev => Math.max(0, prev - 1))}
                                    disabled={activeImage === 0}
                                    className="absolute left-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 disabled:opacity-30 transition-opacity"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={() => setActiveImage(prev => Math.min(data.images.length - 1, prev + 1))}
                                    disabled={activeImage === data.images.length - 1}
                                    className="absolute right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 disabled:opacity-30 transition-opacity"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Thumbnails */}
                            <div className="h-20 bg-black/80 flex items-center gap-2 px-4 overflow-x-auto">
                                {data.images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`relative h-16 w-24 flex-shrink-0 rounded border-2 overflow-hidden ${activeImage === idx ? 'border-indigo-500' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img} alt="" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right Side: Details & Actions */}
                        <div className="w-full md:w-1/3 flex flex-col bg-white border-l border-gray-200">
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                {/* Meta Data */}
                                <div className="space-y-3 pb-4 border-b border-gray-100">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                        <span>Submitted: {data.date}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                        <span>{data.location}</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Progress Description</h4>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {data.description}
                                    </p>
                                </div>

                                {/* Material Usage */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Material Usage</h4>
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                        {data.materialUsage.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-xs">
                                                <span className="text-gray-600">{item.item}</span>
                                                <span className="font-medium text-gray-900">{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Documents */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Attached Documents</h4>
                                    <div className="space-y-2">
                                        {data.documents.map((doc: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50">
                                                <div className="flex items-center overflow-hidden">
                                                    <FileText className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                                    <span className="text-xs text-gray-700 truncate">{doc.name}</span>
                                                </div>
                                                <button className="text-indigo-600 hover:text-indigo-800">
                                                    <Download className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Feedback Input (Only if querying) */}
                                {status === 'queried' && (
                                    <div className="animate-fade-in">
                                        <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-2">
                                            Query Reason / Instructions
                                        </label>
                                        <textarea
                                            rows={4}
                                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                            placeholder="Explain what needs to be corrected..."
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                        ></textarea>
                                    </div>
                                )}
                            </div>

                            {/* Sticky Footer Actions */}
                            <div className="p-4 border-t border-gray-200 bg-gray-50">
                                {status === 'approved' ? (
                                    <div className="flex items-center justify-center text-green-600 font-bold p-2 bg-green-50 rounded-lg border border-green-200">
                                        <CheckCircle className="h-5 w-5 mr-2" />
                                        Verified & Approved
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {status !== 'queried' ? (
                                            <>
                                                <button
                                                    onClick={() => setStatus('queried')}
                                                    className="flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                                                    Query
                                                </button>
                                                <button
                                                    onClick={handleApprove}
                                                    className="flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Approve
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setStatus('pending')}
                                                    className="flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleQuery}
                                                    disabled={!feedback}
                                                    className="flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    Send Query
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
