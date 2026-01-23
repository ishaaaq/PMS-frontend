import { useState } from 'react';
import {
    Clock,
    CheckCircle,
    AlertTriangle,
    Search,
    Filter,
    ChevronRight,
    MapPin
} from 'lucide-react';
import VerifyMilestoneModal from '../dashboard/VerifyMilestoneModal';

export default function SubmissionQueue() {
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'pending' | 'queried' | 'approved'>('pending');

    // Mock submissions
    const submissions = [
        {
            id: '1',
            project: 'ICT Center Construction',
            contractor: 'BuildRight Construction',
            milestone: 'Foundation Pouring',
            submitted: '2 hours ago',
            status: 'pending',
            location: 'Lagos',
            priority: 'high'
        },
        {
            id: '2',
            project: 'Solar Mini-Grid',
            contractor: 'GreenEnergy Solutions',
            milestone: 'Panel Installation',
            submitted: '5 hours ago',
            status: 'pending',
            location: 'Kano',
            priority: 'normal'
        },
        {
            id: '3',
            project: 'ICT Center Construction',
            contractor: 'BuildRight Construction',
            milestone: 'Site Clearing',
            submitted: '2 days ago',
            status: 'approved',
            location: 'Lagos',
            priority: 'normal'
        }
    ];

    const filteredSubmissions = submissions.filter(s => s.status === activeTab);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
                    <p className="text-gray-500 text-sm">Review contractor submissions and evidence.</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['pending', 'queried', 'approved'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((sub) => (
                        <div
                            key={sub.id}
                            onClick={() => setSelectedSubmission(sub)}
                            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-full ${sub.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900">{sub.milestone}</h3>
                                            {sub.priority === 'high' && (
                                                <span className="bg-red-100 text-red-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                                                    Urgent
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">{sub.project}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                            <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {sub.location}</span>
                                            <span className="font-medium text-indigo-600">{sub.contractor}</span>
                                            <span>• {sub.submitted}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-gray-400 group-hover:text-indigo-600 transition-colors">
                                    <ChevronRight className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <CheckCircle className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-sm font-medium text-gray-900">No submissions found</h3>
                        <p className="text-xs text-gray-500 mt-1">There are no {activeTab} items in your queue.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <VerifyMilestoneModal
                isOpen={!!selectedSubmission}
                onClose={() => setSelectedSubmission(null)}
                submission={selectedSubmission}
            />
        </div>
    );
}
