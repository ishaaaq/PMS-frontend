import {
    Flag, Calendar, CheckCircle, Clock, AlertCircle,
    ArrowRight, Filter, ChevronRight
} from 'lucide-react';

const MILESTONES = [
    {
        id: 1,
        project: 'Lagos-Ibadan Expressway Section B',
        title: 'Foundation Completion',
        date: '2024-03-15',
        status: 'completed',
        contractor: 'Julius Berger',
        progress: 100
    },
    {
        id: 2,
        project: 'Abuja Solar Farm',
        title: 'Panel Installation Phase 1',
        date: '2025-06-01',
        status: 'upcoming',
        contractor: 'Sterling & Wilson',
        progress: 0
    },
    {
        id: 3,
        project: 'Port Harcourt Pipeline Rehabilitation',
        title: 'Safety Inspection Audit',
        date: '2024-12-10',
        status: 'overdue',
        contractor: 'OilServ',
        progress: 85
    },
    {
        id: 4,
        project: 'Kano Water Treatment Facility',
        title: 'Procurement of Filtration Units',
        date: '2025-02-28',
        status: 'in_progress',
        contractor: 'Mothercat',
        progress: 45
    },
    {
        id: 5,
        project: 'Enugu Road Construction',
        title: 'Asphalt Laying',
        date: '2025-01-20',
        status: 'completed',
        contractor: 'RCC',
        progress: 100
    }
];

export default function MilestonesPage() {

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-4 w-4" />;
            case 'overdue': return <AlertCircle className="h-4 w-4" />;
            case 'in_progress': return <Clock className="h-4 w-4" />;
            default: return <Calendar className="h-4 w-4" />;
        }
    };

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
                    { label: 'Completed', value: '128', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                    { label: 'In Progress', value: '45', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'Upcoming', value: '82', color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-800' },
                    { label: 'Overdue', value: '12', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
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
                    {MILESTONES.map((milestone) => (
                        <div key={milestone.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${getStatusStyle(milestone.status)}`}>
                                            {getStatusIcon(milestone.status)}
                                            {milestone.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> {new Date(milestone.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-ptdf-primary transition-colors cursor-pointer">
                                        {milestone.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        <span>{milestone.project}</span>
                                        <span>•</span>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{milestone.contractor}</span>
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
                                                className={`h-full rounded-full ${milestone.status === 'completed' ? 'bg-green-500' :
                                                    milestone.status === 'overdue' ? 'bg-red-500' :
                                                        milestone.status === 'in_progress' ? 'bg-blue-500' :
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
                    ))}
                </div>
            </div>
        </div>
    );
}
