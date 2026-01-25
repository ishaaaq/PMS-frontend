import { useEffect, useState } from 'react';
import { getContractorAssignments } from '../../services/contractor';
import type { Assignment, Milestone } from '../../services/contractor';
import ProgressReportModal from '../../components/contractor/ProgressReportModal';
import type { ProgressReportData } from '../../components/contractor/ProgressReportModal';
import {
    Search, Filter, MapPin, Calendar, ChevronDown, ChevronUp,
    AlertTriangle, CheckCircle, Clock, Upload, DollarSign
} from 'lucide-react';

export default function ContractorAssignmentsPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [expandedProject, setExpandedProject] = useState<string | null>(null);
    const [selectedMilestone, setSelectedMilestone] = useState<{ milestone: Milestone; projectTitle: string; isQueried: boolean } | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await getContractorAssignments();
                setAssignments(data);
                // Auto-expand first queried project
                const queried = data.find(a => a.status === 'QUERIED');
                if (queried) setExpandedProject(queried.id);
            } catch (error) {
                console.error('Failed to load assignments', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'QUERIED': return { color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50', icon: AlertTriangle, iconColor: 'text-red-500 dark:text-red-400' };
            case 'PENDING_APPROVAL': return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900/50', icon: Clock, iconColor: 'text-yellow-500 dark:text-yellow-400' };
            case 'COMPLETED': return { color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50', icon: CheckCircle, iconColor: 'text-green-500 dark:text-green-400' };
            default: return { color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50', icon: Clock, iconColor: 'text-blue-500 dark:text-blue-400' };
        }
    };

    const filteredAssignments = assignments.filter(a => {
        const matchesSearch = a.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Sort: Queried first, then In Progress, then Pending, then Completed
    const sortedAssignments = [...filteredAssignments].sort((a, b) => {
        const priority: Record<string, number> = { 'QUERIED': 0, 'IN_PROGRESS': 1, 'PENDING_APPROVAL': 2, 'COMPLETED': 3 };
        return (priority[a.status] ?? 4) - (priority[b.status] ?? 4);
    });

    const handleUpdateProgress = (milestone: Milestone, projectTitle: string) => {
        setSelectedMilestone({
            milestone,
            projectTitle,
            isQueried: milestone.status === 'QUERIED'
        });
    };

    const handleSubmitReport = (data: ProgressReportData) => {
        console.log('Submitting progress report:', data);
        // In a real app, this would call an API
        setSelectedMilestone(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
                <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>)}
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <header>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Assignments</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and manage your project milestones</p>
            </header>

            {/* Search & Filter */}
            <div className="glass-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="All">All Status</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="QUERIED">Queried</option>
                            <option value="PENDING_APPROVAL">Pending Approval</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass-card rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{assignments.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Total Projects</p>
                </div>
                <div className="glass-card rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{assignments.filter(a => a.status === 'IN_PROGRESS').length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">In Progress</p>
                </div>
                <div className="glass-card rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 text-center">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{assignments.filter(a => a.status === 'QUERIED').length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Need Action</p>
                </div>
                <div className="glass-card rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{assignments.filter(a => a.status === 'COMPLETED').length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Completed</p>
                </div>
            </div>

            {/* Project List */}
            <div className="space-y-4">
                {sortedAssignments.map(assignment => {
                    const config = getStatusConfig(assignment.status);
                    const StatusIcon = config.icon;
                    const isExpanded = expandedProject === assignment.id;

                    return (
                        <div
                            key={assignment.id}
                            className={`glass-card rounded-xl shadow-sm border overflow-hidden transition-all ${assignment.status === 'QUERIED' ? 'border-red-300 ring-1 ring-red-100 dark:border-red-500/50 dark:ring-red-900/30' : 'border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            {/* Project Header */}
                            <div
                                className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                onClick={() => setExpandedProject(isExpanded ? null : assignment.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{assignment.projectTitle}</h3>
                                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${config.color}`}>
                                                {assignment.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{assignment.location}</span>
                                            <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" />Updated {assignment.lastUpdated}</span>
                                            <span>{assignment.milestones.length} milestones</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{assignment.overallProgress}%</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Complete</p>
                                        </div>
                                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                            {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
                                        </button>
                                    </div>
                                </div>
                                {/* Progress bar */}
                                <div className="mt-4">
                                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${assignment.status === 'QUERIED' ? 'bg-red-500' :
                                                assignment.status === 'COMPLETED' ? 'bg-green-500' : 'bg-indigo-500'
                                                }`}
                                            style={{ width: `${assignment.overallProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Milestones */}
                            {isExpanded && (
                                <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-5">
                                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase mb-4">Milestone Timeline</h4>
                                    <div className="space-y-4">
                                        {assignment.milestones.map((milestone, idx) => {
                                            const mConfig = getStatusConfig(milestone.status);
                                            const MIcon = mConfig.icon;
                                            return (
                                                <div key={milestone.id} className="relative pl-8">
                                                    {/* Timeline connector */}
                                                    {idx < assignment.milestones.length - 1 && (
                                                        <span className="absolute left-3 top-8 w-0.5 h-[calc(100%+8px)] bg-gray-200 dark:bg-gray-700"></span>
                                                    )}
                                                    {/* Icon */}
                                                    <span className={`absolute left-0 top-1 h-6 w-6 rounded-full flex items-center justify-center ring-4 ring-gray-50 dark:ring-gray-800 ${milestone.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900' :
                                                        milestone.status === 'QUERIED' ? 'bg-red-100 dark:bg-red-900' :
                                                            milestone.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-blue-100 dark:bg-blue-900'
                                                        }`}>
                                                        <MIcon className={`h-3.5 w-3.5 ${mConfig.iconColor}`} />
                                                    </span>
                                                    {/* Content */}
                                                    <div className={`bg-white dark:bg-gray-800 rounded-lg border p-4 ${milestone.status === 'QUERIED' ? 'border-red-200 dark:border-red-900/50' : 'border-gray-200 dark:border-gray-700'
                                                        }`}>
                                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white">{milestone.title}</p>
                                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                    <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" />Due: {milestone.dueDate}</span>
                                                                    <span className="flex items-center"><DollarSign className="h-3 w-3 mr-1" />{formatMoney(milestone.amount)}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {milestone.status !== 'COMPLETED' && (
                                                                    <div className="text-right">
                                                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{milestone.progress}%</p>
                                                                    </div>
                                                                )}
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${mConfig.color}`}>
                                                                    {milestone.status.replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {/* Progress bar for non-completed */}
                                                        {milestone.status !== 'COMPLETED' && (
                                                            <div className="mt-3">
                                                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${milestone.status === 'QUERIED' ? 'bg-red-500' : 'bg-indigo-500'
                                                                            }`}
                                                                        style={{ width: `${milestone.progress}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {/* Action buttons */}
                                                        {(milestone.status === 'IN_PROGRESS' || milestone.status === 'QUERIED') && (
                                                            <div className="mt-4 flex flex-wrap gap-2">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleUpdateProgress(milestone, assignment.projectTitle); }}
                                                                    className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md shadow-sm transition-colors ${milestone.status === 'QUERIED'
                                                                        ? 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
                                                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                                                                        }`}
                                                                >
                                                                    <Upload className="h-3 w-3 mr-1.5" />
                                                                    {milestone.status === 'QUERIED' ? 'Fix & Resubmit' : 'Update Progress'}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {sortedAssignments.length === 0 && (
                <div className="glass-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <Filter className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects found</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
                </div>
            )}
            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slide-up z-50">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Progress report submitted successfully!</span>
                </div>
            )}

            {/* Progress Report Modal */}
            {selectedMilestone && (
                <ProgressReportModal
                    milestone={selectedMilestone.milestone}
                    projectTitle={selectedMilestone.projectTitle}
                    isQueried={selectedMilestone.isQueried}
                    onClose={() => setSelectedMilestone(null)}
                    onSubmit={handleSubmitReport}
                />
            )}
        </div>
    );
}
