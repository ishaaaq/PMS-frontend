import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreVertical, CheckCircle, Clock, MapPin } from 'lucide-react';
import { ProjectsService } from '../../services/projects.service';

interface ProjectRow {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    total_budget: number;
    status: string;
    created_at: string;
}

export default function ConsultantProjectList() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState<ProjectRow[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        ProjectsService.getMyProjects()
            .then(data => {
                setProjects((data || []) as ProjectRow[]);
            })
            .catch(err => console.error('Failed to fetch projects:', err))
            .finally(() => setIsLoading(false));
    }, []);

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.location || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        const s = status.toUpperCase();
        if (s === 'COMPLETED') return { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400', icon: CheckCircle, label: 'Completed' };
        if (s === 'ACTIVE') return { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400', icon: Clock, label: 'Active' };
        return { color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300', icon: Clock, label: status };
    };

    const formatBudget = (amt: number) => `₦${Number(amt).toLocaleString()}`;

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Projects</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Monitor progress and compliance for your assigned sites.</p>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Filter className="h-4 w-4" /> Filter
                    </button>
                </div>
            </div>

            {/* List View */}
            <div className="glass-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {filteredProjects.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p>{projects.length === 0 ? 'No projects assigned yet.' : 'No projects match your search.'}</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Budget</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredProjects.map((project) => {
                                const badge = getStatusBadge(project.status);
                                const StatusIcon = badge.icon;
                                return (
                                    <tr
                                        key={project.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/dashboard/consultant/projects/${project.id}`)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{project.title}</span>
                                                {project.location && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                                        <MapPin className="h-3 w-3" /> {project.location}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{formatBudget(project.total_budget)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {badge.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(project.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                                <MoreVertical className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
