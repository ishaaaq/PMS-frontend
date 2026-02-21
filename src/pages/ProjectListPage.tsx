import { useEffect, useState } from 'react';
import { getProjects, type Project } from '../services/projects';
import { Search, Filter, Plus, MapPin, Link as LinkIcon, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProjectListPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getProjects().then((data) => {
            setProjects(data);
            setLoading(false);
        });
    }, []);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'delayed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h2>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Manage and monitor ongoing projects across all zones</p>
                </div>
                <div className="flex gap-3">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95">
                        <Plus className="-ml-1 mr-2 h-4 w-4 text-gray-400" />
                        Invite Contractor
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/projects/new')}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-lg shadow-ptdf-primary/30 text-sm font-medium text-white bg-ptdf-primary hover:bg-ptdf-secondary transition-all active:scale-95"
                    >
                        <Plus className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                        Add Project
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-4 py-2 text-sm border-gray-200 dark:border-gray-700 rounded-xl focus:ring-ptdf-primary focus:border-ptdf-primary bg-gray-50/50 dark:bg-gray-900/50"
                        placeholder="Search projects by name, code or contractor..."
                    />
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Filter className="mr-2 h-4 w-4 text-gray-400" /> Filter
                </button>
            </div>

            {/* Projects Grid */}
            {loading ? (
                <div className="space-y-6 animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {projects.map((project, idx) => (
                        <div key={`${project.id}-${idx}`} className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-ptdf-primary/30 transition-all duration-300 flex flex-col h-full">
                            <div className="p-5 space-y-4 flex-1">
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-ptdf-primary transition-colors">
                                        {project.title}
                                    </h3>
                                    <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(project.status || 'active')}`}>
                                        {project.status || 'Active'}
                                    </span>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <span className="truncate">{project.lga}, {project.state}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 gap-2">
                                        <LinkIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <span className="truncate font-medium">{project.contractor}</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-semibold text-gray-500">
                                            <span>Progress</span>
                                            <span>{project.progress}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-ptdf-primary to-emerald-400 rounded-full"
                                                style={{ width: `${project.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-5 py-4 border-t border-gray-50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" /> Apr 12, 2024
                                </span>
                                <button
                                    onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                                    className="text-xs font-bold text-ptdf-primary hover:text-ptdf-secondary flex items-center gap-1"
                                >
                                    View Details <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
