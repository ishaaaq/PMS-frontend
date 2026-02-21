import { useState, useEffect } from 'react';
import {
    Clock, CheckCircle, AlertTriangle, FileText,
    ChevronDown, ChevronUp, Eye, Filter
} from 'lucide-react';
import { SubmissionsService } from '../../services/submissions.service';
import VerifyMilestoneModal from './VerifyMilestoneModal';

type StatusFilter = 'ALL' | 'PENDING_APPROVAL' | 'QUERIED' | 'APPROVED';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Submission = any;

export default function SubmissionHistoryTab({ projectId }: { projectId: string }) {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<StatusFilter>('ALL');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [viewSubmission, setViewSubmission] = useState<Submission | null>(null);

    useEffect(() => {
        SubmissionsService.getProjectSubmissions(projectId)
            .then(data => {
                setSubmissions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load submissions', err);
                setError('Failed to load submission history.');
                setLoading(false);
            });
    }, [projectId]);

    const filtered = filter === 'ALL'
        ? submissions
        : submissions.filter(s => s.status === filter);

    const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
        PENDING_APPROVAL: {
            label: 'Pending',
            color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            icon: <Clock className="h-3.5 w-3.5" />
        },
        QUERIED: {
            label: 'Queried',
            color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            icon: <AlertTriangle className="h-3.5 w-3.5" />
        },
        APPROVED: {
            label: 'Approved',
            color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            icon: <CheckCircle className="h-3.5 w-3.5" />
        }
    };

    const counts = {
        ALL: submissions.length,
        PENDING_APPROVAL: submissions.filter(s => s.status === 'PENDING_APPROVAL').length,
        QUERIED: submissions.filter(s => s.status === 'QUERIED').length,
        APPROVED: submissions.filter(s => s.status === 'APPROVED').length,
    };

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-2/3" />
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-500 dark:text-red-400">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                {(['ALL', 'PENDING_APPROVAL', 'QUERIED', 'APPROVED'] as StatusFilter[]).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === f
                                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        {f === 'ALL' ? 'All' : f === 'PENDING_APPROVAL' ? 'Pending' : f.charAt(0) + f.slice(1).toLowerCase()}
                        <span className="ml-1.5 opacity-60">{counts[f]}</span>
                    </button>
                ))}
            </div>

            {/* Submissions List */}
            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No submissions found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        {filter === 'ALL'
                            ? 'No milestone submissions have been made for this project yet.'
                            : `No ${filter.toLowerCase().replace('_', ' ')} submissions.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((sub) => {
                        const config = statusConfig[sub.status] || statusConfig.PENDING_APPROVAL;
                        const isExpanded = expandedId === sub.id;
                        const contractorName = sub.contractor?.full_name || 'Unknown Contractor';
                        const reviewerName = sub.reviewer?.full_name;
                        const milestoneTitle = sub.milestone?.title || 'Unknown Milestone';

                        return (
                            <div
                                key={sub.id}
                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all"
                            >
                                {/* Header Row */}
                                <div
                                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                    onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${config.color}`}>
                                                {config.icon}
                                                {config.label}
                                            </span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                {new Date(sub.submitted_at).toLocaleDateString('en-NG', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {milestoneTitle}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            Submitted by <span className="font-medium text-gray-700 dark:text-gray-300">{contractorName}</span>
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewSubmission(sub);
                                            }}
                                            className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                            title="View details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        {isExpanded
                                            ? <ChevronUp className="h-4 w-4 text-gray-400" />
                                            : <ChevronDown className="h-4 w-4 text-gray-400" />
                                        }
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3 animate-fade-in">
                                        {/* Work Description */}
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Work Description</h5>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {sub.work_description || 'No description provided.'}
                                            </p>
                                        </div>

                                        {/* Query Note */}
                                        {sub.query_note && (
                                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg p-3">
                                                <h5 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Query Note
                                                </h5>
                                                <p className="text-sm text-red-700 dark:text-red-300">{sub.query_note}</p>
                                            </div>
                                        )}

                                        {/* Review Metadata */}
                                        {sub.reviewed_at && (
                                            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                                                <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Review Information</h5>
                                                <div className="flex flex-wrap gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400">Reviewed by: </span>
                                                        <span className="font-medium text-gray-900 dark:text-white">{reviewerName || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400">Reviewed on: </span>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {new Date(sub.reviewed_at).toLocaleDateString('en-NG', {
                                                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detailed View Modal */}
            <VerifyMilestoneModal
                isOpen={!!viewSubmission}
                onClose={() => setViewSubmission(null)}
                submission={viewSubmission ? {
                    id: viewSubmission.id,
                    milestone: viewSubmission.milestone?.title,
                    contractor: viewSubmission.contractor?.full_name || 'Unknown',
                    date: new Date(viewSubmission.submitted_at).toLocaleDateString(),
                    description: viewSubmission.work_description,
                    location: 'N/A'
                } : undefined}
                readOnly
            />
        </div>
    );
}
