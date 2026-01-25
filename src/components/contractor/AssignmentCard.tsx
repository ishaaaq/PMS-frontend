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
                    color: 'bg-red-50 text-red-700 border-red-200',
                    icon: AlertTriangle,
                    label: 'Action Needed'
                };
            case 'PENDING_APPROVAL':
                return {
                    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                    icon: Clock,
                    label: 'Pending Approval'
                };
            case 'COMPLETED':
                return {
                    color: 'bg-green-50 text-green-700 border-green-200',
                    icon: CheckCircle,
                    label: 'Completed'
                };
            default: // IN_PROGRESS
                return {
                    color: 'bg-blue-50 text-blue-700 border-blue-200',
                    icon: Clock,
                    label: 'In Progress'
                };
        }
    };

    const config = getStatusConfig(assignment.status);
    const StatusIcon = config.icon;

    const isQueried = assignment.status === 'QUERIED';

    return (
        <div className={`bg-white rounded-lg border shadow-sm p-4 transition-all hover:shadow-md ${isQueried ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {config.label}
                        </span>
                        <span className="text-xs text-gray-400">Due {assignment.dueDate}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-base">{assignment.milestoneTitle}</h4>
                    <p className="text-sm text-gray-500 line-clamp-1">{assignment.projectTitle}</p>
                </div>
                <div className="shrink-0 ml-2">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="24" cy="24" r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                className="text-gray-100"
                            />
                            <circle
                                cx="24" cy="24" r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray={125.6}
                                strokeDashoffset={125.6 - (125.6 * assignment.currentProgress) / 100}
                                className={isQueried ? 'text-red-500' : 'text-ptdf-primary'}
                            />
                        </svg>
                        <span className="absolute text-[10px] font-bold text-gray-700">{assignment.currentProgress}%</span>
                    </div>
                </div>
            </div>

            {isQueried && (
                <div className="mb-4 bg-red-50 p-3 rounded-md border border-red-100">
                    <p className="text-xs text-red-800 font-medium">
                        <span className="font-bold">Consultant Query:</span> {assignment.queryReason}
                    </p>
                </div>
            )}

            <button
                onClick={() => onUpdateProgress(assignment.id)}
                className={`w-full py-2.5 px-4 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${isQueried
                    ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
                    : 'bg-ptdf-primary hover:bg-ptdf-primary/90 text-white focus:ring-ptdf-primary'
                    }`}
            >
                {isQueried ? 'Fix & Resubmit' : 'Update Progress'}
            </button>
        </div>
    );
}
