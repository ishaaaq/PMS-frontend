
import { Folder, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const stats = [
    { name: 'Total Projects', stat: '12', icon: Folder, color: 'bg-blue-500' },
    { name: 'Ongoing Milestones', stat: '4', icon: Clock, color: 'bg-yellow-500' },
    { name: 'Pending Approvals', stat: '2', icon: AlertTriangle, color: 'bg-red-500' },
    { name: 'Completed Projects', stat: '5', icon: CheckCircle, color: 'bg-green-500' },
];

export default function DashboardStats() {
    return (
        <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Overview</h3>
            <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.name} className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden">
                        <dt>
                            <div className={`absolute rounded-md p-3 ${item.color}`}>
                                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
                        </dt>
                        <dd className="ml-16 pb-1 flex items-baseline sm:pb-7">
                            <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
