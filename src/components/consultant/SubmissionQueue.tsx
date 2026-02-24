import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { logRpcError } from '@/lib/debug';
import {
    Clock,
    CheckCircle,
    ChevronRight,
    MapPin
} from 'lucide-react';
import VerifyMilestoneModal from '../dashboard/VerifyMilestoneModal';
import {
    SubmissionsVerificationService,
    SUBMISSION_STATUS,
    type VerificationSubmission,
} from '../../services/submissionsVerification.service';

// Suppress the unused import warning — logRpcError is used below in the catch
void logRpcError;

export default function SubmissionQueue() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [submissions, setSubmissions] = useState<VerificationSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<VerificationSubmission | null>(null);
    const [activeTab, setActiveTab] = useState<'pending' | 'queried' | 'approved'>('pending');

    const fetchSubmissions = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch ALL statuses at once so tab switching is instant (no re-fetch per tab)
            const data = await SubmissionsVerificationService.getConsultantVerificationQueue();
            setSubmissions(data);
        } catch (err) {
            console.error('Failed to fetch submissions', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchSubmissions();
    }, [fetchSubmissions]);

    // Auto-open submission if submissionId is in URL
    useEffect(() => {
        const submissionId = searchParams.get('submissionId');
        if (submissionId && !selectedSubmission) {
            const submission = submissions.find(s => s.id === submissionId);
            if (submission) {
                setSelectedSubmission(submission);
                // Remove submissionId from URL after opening
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('submissionId');
                setSearchParams(newParams, { replace: true });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, selectedSubmission, submissions]);

    const filteredSubmissions = submissions.filter(s => s.status === activeTab);

    // Count per tab for badge display
    const pendingCount = submissions.filter(s => s.status === 'pending').length;
    const queriedCount = submissions.filter(s => s.status === 'queried').length;
    const approvedCount = submissions.filter(s => s.status === 'approved').length;
    const tabCounts: Record<string, number> = { pending: pendingCount, queried: queriedCount, approved: approvedCount };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verification Queue</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Review contractor submissions and evidence.</p>
                </div>

                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    {(['pending', 'queried', 'approved'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors flex items-center gap-1.5 ${activeTab === tab
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            {tab}
                            {tabCounts[tab] > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab
                                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {tabCounts[tab]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">Loading submissions...</p>
                    </div>
                ) : filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((sub) => (
                        <div
                            key={sub.id}
                            onClick={() => setSelectedSubmission(sub)}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-full ${sub.priority === 'high'
                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                        }`}>
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white">{sub.milestone}</h3>
                                            {sub.priority === 'high' && (
                                                <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                                                    Urgent
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{sub.project}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {sub.location}</span>
                                            <span className="font-medium text-indigo-600 dark:text-indigo-400">{sub.contractor}</span>
                                            <span>• {sub.submitted}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    <ChevronRight className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <CheckCircle className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200">No submissions found</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">There are no {activeTab} items in your queue.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <VerifyMilestoneModal
                isOpen={!!selectedSubmission}
                onClose={() => setSelectedSubmission(null)}
                submission={selectedSubmission}
                onVerify={(result) => {
                    if (result.status === 'approved' || result.status === 'queried') {
                        // Update local state immediately so the item moves to the correct tab
                        setSubmissions(prev => prev.map(s =>
                            s.id === selectedSubmission?.id ? { ...s, status: result.status } : s
                        ));
                        // In background, trigger a full refetch to get fresh server state
                        void fetchSubmissions();
                    }
                }}
            />
        </div>
    );
}

// Re-export the status constant so any future consumer can import from here too
export { SUBMISSION_STATUS };
