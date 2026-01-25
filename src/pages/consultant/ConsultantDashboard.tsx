
import { useNavigate } from 'react-router-dom';
import {
    Briefcase,
    CheckCircle,
    Clock,
    AlertCircle,
    ChevronRight,
    MessageSquare,
    FileText,
    Bell
} from 'lucide-react';

export default function ConsultantDashboard() {
    const navigate = useNavigate();

    // Mock data - replace with API calls later
    const urgentTasks = [
        { id: 1, type: 'Verification', project: 'ICT Center Construction', contractor: 'BuildRight Ltd', submitted: '2h ago', deadline: '24h' },
        { id: 2, type: 'Query Response', project: 'Solar Mini-Grid', contractor: 'GreenEnergy', submitted: '5h ago', deadline: '48h' },
    ];

    const activeProjects = [
        { id: '1', title: 'ICT Center Construction', location: 'Lagos', status: 'Active', progress: 45, nextMilestone: 'Roofing' },
        { id: '2', title: 'Solar Mini-Grid', location: 'Kano', status: 'Active', progress: 12, nextMilestone: 'Foundation' },
        { id: '3', title: 'Laboratory Equipment', location: 'Rivers', status: 'Pending', progress: 0, nextMilestone: 'Mobilization' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* targeted header - minimal and focused */}
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Consultant Overview</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage verifications and monitor project compliance.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/dashboard/consultant/notifications')}
                        className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <Bell className="h-6 w-6" />
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                    </button>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                        Compose Report
                    </button>
                </div>
            </div>

            {/* Action Required Section - High priority */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Action Required</h2>
                    <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {urgentTasks.length}
                    </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {urgentTasks.map((task) => (
                        <div key={task.id} className="glass-card p-5 rounded-xl shadow-sm border border-l-4 border-gray-200 dark:border-gray-700 border-l-indigo-500 dark:border-l-indigo-500 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex justify-between items-start mb-3">
                                <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                                    {task.type}
                                </span>
                                <span className="flex items-center text-xs text-orange-600 dark:text-orange-400 font-medium">
                                    <Clock className="h-3 w-3 mr-1" /> {task.deadline} left
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{task.project}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Submitted by <span className="font-medium text-gray-700 dark:text-gray-300">{task.contractor}</span></p>

                            <button className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium transition-colors">
                                Review Submission
                            </button>
                        </div>
                    ))}

                    {/* Empty state placeholder if needed */}
                    {urgentTasks.length === 0 && (
                        <div className="col-span-full p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                            <CheckCircle className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                            <p className="text-gray-500 dark:text-gray-400">All caught up! No pending actions.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Project Status Overview - Card Grid */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assigned Projects</h2>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/consultant/projects')}
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center"
                    >
                        View All Projects <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {activeProjects.map((project) => (
                        <div key={project.id} className="glass-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900 dark:text-white truncate pr-2">{project.title}</h3>
                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${project.status === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                        }`}>
                                        {project.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex items-center">
                                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded text-[10px] mr-2">{project.location}</span>
                                    Next: {project.nextMilestone}
                                </p>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500 dark:text-gray-400">Progress</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{project.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                                        <div
                                            className="bg-green-500 h-1.5 rounded-full"
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-between">
                                <button className="text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-1">
                                    <FileText className="h-3 w-3" /> Reports
                                </button>
                                <button className="text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" /> Messages
                                </button>
                                <button
                                    onClick={() => navigate(`/dashboard/consultant/projects/${project.id}`)}
                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                                >
                                    Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
