
import { useState, useEffect } from 'react';
import {
    Flag, Calendar, CheckCircle, Clock, AlertCircle,
    ArrowRight, Filter, ChevronRight
} from 'lucide-react';
import VerifyMilestoneModal from '../components/dashboard/VerifyMilestoneModal';
import { getAllMilestones, type Milestone, MilestoneStatus, type ApprovedSubmission } from '../services/milestones';

export default function MilestonesPage() {
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<ApprovedSubmission | null>(null);

    useEffect(() => {
        getAllMilestones()
            .then(data => {
                setMilestones(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch milestones', err);
                setLoading(false);
            });
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case MilestoneStatus.COMPLETED: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'OVERDUE': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case MilestoneStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case MilestoneStatus.COMPLETED: return <CheckCircle className="h-4 w-4" />;
            case 'OVERDUE': return <AlertCircle className="h-4 w-4" />;
            case MilestoneStatus.IN_PROGRESS: return <Clock className="h-4 w-4" />;
            default: return <Calendar className="h-4 w-4" />;
        }
    };

    const handleMilestoneClick = (milestone: Milestone) => {
        // Only allow viewing submission if milestone is completed and has approved submission
        if (milestone.status === MilestoneStatus.COMPLETED && milestone.approvedSubmission) {
            setSelectedSubmission(milestone.approvedSubmission);
        }
    };

    // Derived stats
    const stats = {
        completed: milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length,
        inProgress: milestones.filter(m => m.status === MilestoneStatus.IN_PROGRESS).length,
        upcoming: milestones.filter(m => m.status === MilestoneStatus.NOT_STARTED).length,
        overdue: milestones.filter(m => {
            const dueDate = new Date(m.dueDate);
            const now = new Date();
            return m.status !== MilestoneStatus.COMPLETED && dueDate < now;
        }).length
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>)}
                </div>
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Milestones</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track key deliverables and deadlines across projects</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Filter className="h-4 w-4" /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-ptdf-primary hover:bg-ptdf-secondary text-white rounded-xl shadow-lg shadow-ptdf-primary/20 transition-all active:scale-95 text-sm font-medium">
                        <Flag className="h-4 w-4" /> New Milestone
                    </button>
                </div>
            </div>

            {/* Timeline Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Completed', value: stats.completed, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                    { label: 'In Progress', value: stats.inProgress, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'Upcoming', value: stats.upcoming, color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-800' },
                    { label: 'Overdue', value: stats.overdue, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                            <Flag className={`h-5 w-5 ${stat.color}`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Milestones List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white">Recent & Upcoming Milestones</h3>
                    <button className="text-sm font-medium text-ptdf-primary hover:text-ptdf-secondary flex items-center gap-1">
                        View Calendar <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {milestones.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No milestones found.</div>
                    ) : milestones.map((milestone) => {
                        const isClickable = milestone.status === MilestoneStatus.COMPLETED && milestone.approvedSubmission;
                        // Check for overdue (logic reused for display)
                        const isOverdue = milestone.status !== MilestoneStatus.COMPLETED && new Date(milestone.dueDate) < new Date();
                        const displayStatus = isOverdue ? 'OVERDUE' : milestone.status;

                        return (
                            <div
                                key={milestone.id}
                                className={`p-6 transition-colors group ${isClickable ? 'hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer' : ''
                                    }`}
                                onClick={() => handleMilestoneClick(milestone)}
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${getStatusStyle(displayStatus)}`}>
                                                {getStatusIcon(displayStatus)}
                                                {displayStatus.replace('_', ' ').toUpperCase()}
                                            </span>
                                            <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" /> {new Date(milestone.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-ptdf-primary transition-colors cursor-pointer">
                                            {milestone.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            <span>{milestone.projectName || 'Unknown Project'}</span>
                                            <span>•</span>
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{milestone.contractorName || 'Unassigned'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 lg:min-w-[300px]">
                                        <div className="flex-1">
                                            <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
                                                <span>Progress</span>
                                                <span>{milestone.progress}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${milestone.status === MilestoneStatus.COMPLETED ? 'bg-green-500' :
                                                        isOverdue ? 'bg-red-500' :
                                                            milestone.status === MilestoneStatus.IN_PROGRESS ? 'bg-blue-500' :
                                                                'bg-gray-300'
                                                        }`}
                                                    style={{ width: `${milestone.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                        <button className="p-2 text-gray-400 hover:text-ptdf-primary hover:bg-ptdf-primary/5 rounded-lg transition-colors">
                                            <ArrowRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>


            {/* Submission Details Modal - Read-only for Admin */}
            <VerifyMilestoneModal
                isOpen={!!selectedSubmission}
                onClose={() => setSelectedSubmission(null)}
                submission={selectedSubmission}
                readOnly
            />
        </div >
    );
}
