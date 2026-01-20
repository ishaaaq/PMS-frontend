
import { useEffect, useState } from 'react';
import { getProjectMilestones, type Milestone, MilestoneStatus } from '../../services/milestones';
import { Calendar, CheckCircle, Circle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';

export default function MilestonesTab({ projectId }: { projectId: string }) {
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProjectMilestones(projectId).then((data) => {
            setMilestones(data);
            setLoading(false);
        });
    }, [projectId]);

    if (loading) return <div className="py-8 text-center text-gray-500">Loading milestones...</div>;

    const getStatusIcon = (status: MilestoneStatus) => {
        switch (status) {
            case MilestoneStatus.COMPLETED:
            case MilestoneStatus.VERIFIED:
            case MilestoneStatus.PAID:
                return <CheckCircle className="h-6 w-6 text-green-500" />;
            case MilestoneStatus.IN_PROGRESS:
                return <Clock className="h-6 w-6 text-blue-500" />;
            default:
                return <Circle className="h-6 w-6 text-gray-300" />;
        }
    };

    const getStatusColor = (status: MilestoneStatus) => {
        switch (status) {
            case MilestoneStatus.COMPLETED:
            case MilestoneStatus.VERIFIED:
            case MilestoneStatus.PAID:
                return 'success';
            case MilestoneStatus.IN_PROGRESS:
                return 'info';
            default:
                return 'default';
        }
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Project Milestones</h3>
            <div className="flow-root">
                <ul className="-mb-8">
                    {milestones.map((milestone, milestoneIdx) => (
                        <li key={milestone.id}>
                            <div className="relative pb-8">
                                {milestoneIdx !== milestones.length - 1 ? (
                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                ) : null}
                                <div className="relative flex space-x-3">
                                    <div>
                                        <span className={cn("h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-white")}>
                                            {getStatusIcon(milestone.status)}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {milestone.title}
                                                <Badge variant={getStatusColor(milestone.status)} className="ml-2">
                                                    {milestone.status}
                                                </Badge>
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
                                        </div>
                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                            <div className="flex items-center justify-end">
                                                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                                <time dateTime={milestone.dueDate}>{milestone.dueDate}</time>
                                            </div>
                                            <div className="font-medium text-gray-900 mt-1 flex items-center justify-end">
                                                <span className="text-xs text-gray-400 mr-1">Amount:</span> ₦{milestone.amount.toLocaleString()}
                                            </div>
                                            {milestone.status === MilestoneStatus.IN_PROGRESS && (
                                                <div className="mt-2 w-32 ml-auto">
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${milestone.progress}%` }}></div>
                                                    </div>
                                                    <p className="text-xs text-right mt-1">{milestone.progress}%</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
