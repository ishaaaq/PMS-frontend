import type { Assignment } from '../../services/contractor';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface AssignmentCardProps {
    assignment: Assignment;
    onUpdateProgress: (id: string) => void;
}

export default function AssignmentCard({ assignment, onUpdateProgress }: AssignmentCardProps) {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'QUERIED':
                return {
                    color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50',
                    icon: AlertTriangle,
                    label: 'Action Needed'
                };
            case 'PENDING_APPROVAL':
                return {
                    color: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900/50',
                    icon: Clock,
                    label: 'Pending Approval'
                };
            case 'COMPLETED':
                return {
                    color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50',
                    icon: CheckCircle,
                    label: 'Completed'
                };
            default: // IN_PROGRESS
                return {
                    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50',
                    icon: Clock,
                    label: 'In Progress'
                };
        }
    };

    const config = getStatusConfig(assignment.status);
    const StatusIcon = config.icon;

    const isQueried = assignment.status === 'QUERIED';

    return (
        <div className={`glass-card rounded-lg border shadow-sm p-4 transition-all hover:shadow-md ${isQueried ? 'border-red-300 ring-1 ring-red-100 dark:border-red-500/50 dark:ring-red-900/30' : 'border-gray-200 dark:border-gray-700'}`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {config.label}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">Due {assignment.dueDate}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-base">{assignment.milestoneTitle}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{assignment.projectTitle}</p>
                </div>
                <div className="shrink-0 ml-2">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="24" cy="24" r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                className="text-gray-100 dark:text-gray-700"
                            />
                            <circle
                                cx="24" cy="24" r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray={125.6}
                                strokeDashoffset={125.6 - (125.6 * (assignment.currentProgress || 0)) / 100}
                                className={isQueried ? 'text-red-500 dark:text-red-400' : 'text-ptdf-primary dark:text-blue-500'}
                            />
                        </svg>
                        <span className="absolute text-[10px] font-bold text-gray-700 dark:text-gray-300">{assignment.currentProgress || 0}%</span>
                    </div>
                </div>
            </div>

            {isQueried && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-100 dark:border-red-900/30">
                    <p className="text-xs text-red-800 dark:text-red-300 font-medium">
                        <span className="font-bold">Consultant Query:</span> {assignment.queryReason}
                    </p>
                </div>
            )}

            <button
                onClick={() => onUpdateProgress(assignment.id)}
                className={`w-full py-2.5 px-4 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${isQueried
                    ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600'
                    : 'bg-ptdf-primary hover:bg-ptdf-primary/90 text-white focus:ring-ptdf-primary dark:bg-blue-600 dark:hover:bg-blue-700'
                    }`}
            >
                {isQueried ? 'Fix & Resubmit' : 'Update Progress'}
            </button>
        </div>
    );
}
