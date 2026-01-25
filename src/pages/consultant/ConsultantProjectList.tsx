import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreVertical, CheckCircle, Clock } from 'lucide-react';

export default function ConsultantProjectList() {
    const navigate = useNavigate();
    // const [filter, setFilter] = useState('All'); // Will be implemented later

    // Mock data for consultant's assigned projects
    const projects = [
        {
            id: '1',
            title: 'ICT Center Construction',
            contractor: 'BuildRight Ltd',
            location: 'Lagos',
            status: 'Ongoing',
            progress: 45,
            lastUpdate: '2 days ago',
            pendingActions: 1
        },
        {
            id: '2',
            title: 'Solar Mini-Grid Installation',
            contractor: 'GreenEnergy Solutions',
            location: 'Kano',
            status: 'Ongoing',
            progress: 12,
            lastUpdate: '5 hours ago',
            pendingActions: 2
        },
        {
            id: '3',
            title: 'Laboratory Equipment Supply',
            contractor: 'LabTech Nigeria',
            location: 'Rivers',
            status: 'Completed',
            progress: 100,
            lastUpdate: '1 month ago',
            pendingActions: 0
        },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
                    <p className="text-gray-500 text-sm">Monitor progress and compliance for your assigned sites.</p>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <Filter className="h-4 w-4" /> Filter
                    </button>
                </div>
            </div>

            {/* List View - different from Admin grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Project</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contractor</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Progress</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {projects.map((project) => (
                            <tr
                                key={project.id}
                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => navigate(`/dashboard/consultant/projects/${project.id}`)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900">{project.title}</span>
                                        <span className="text-xs text-gray-500">{project.location}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-600">{project.contractor}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                        project.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {project.status === 'Completed' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                        {project.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="bg-indigo-600 h-1.5 rounded-full"
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-medium text-gray-600">{project.progress}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        {project.pendingActions > 0 && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                {project.pendingActions} Pending
                                            </span>
                                        )}
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
