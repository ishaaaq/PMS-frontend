
import { useEffect, useState } from 'react';
import { getProjects, type Project } from '../services/projects';

import { Search, Filter, Plus, MapPin, Star, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProjectListPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getProjects().then((data) => {
            // Duplicate data to fill grid for demo
            setProjects([...data, ...data, ...data]);
            setLoading(false);
        });
    }, []);

    return (
        <div className="space-y-6">
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Projects
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">Manage projects that are currently active.</p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    {/* Secondary Button Style from screenshot */}
                    <button className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                        <Plus className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                        Invite Contractor
                    </button>

                    {/* Primary Button (Blue/Purple from screenshot) */}
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/projects/new')}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Add Project
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="text" className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-2 border bg-white" placeholder="Search project" />
                </div>
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Filter <Filter className="ml-2 h-4 w-4 text-gray-400" />
                </button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {loading ? (
                    <p className="text-center text-gray-500 col-span-full">Loading projects...</p>
                ) : projects.map((project, idx) => (
                    <div key={`${project.id}-${idx}`} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-5 space-y-4">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                                {/* Placeholder Logic for "Active project count" equivalent or Status */}
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {project.status}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 flex items-center"><MapPin className="h-4 w-4 mr-1" /> Location</span>
                                    <span className="font-medium text-gray-900">{project.lga}, {project.state}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 flex items-center"><Star className="h-4 w-4 mr-1" /> Completion</span>
                                    <span className="font-medium text-gray-900">{project.progress}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 flex items-center"><LinkIcon className="h-4 w-4 mr-1" /> Contractor</span>
                                    <span className="font-medium text-indigo-600 truncate max-w-[120px]">{project.contractor}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <button className="w-full text-center text-sm font-medium text-gray-500 hover:text-gray-700">
                                    View details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
