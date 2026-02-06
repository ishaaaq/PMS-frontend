import { useState } from 'react';
import { Search, MapPin, Star, MoreVertical, UserPlus, Briefcase, Filter } from 'lucide-react';
import AssignSectionModal from '../../components/consultant/AssignSectionModal';

interface Contractor {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    specialization: string;
    rating: number;
    assignedProjects: string[];
    sections: Array<{ project: string; section: string }>;
    status: string;
}

export default function ConsultantContractors() {
    const [searchTerm, setSearchTerm] = useState('');
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
    const [selectedProject, setSelectedProject] = useState('All Projects');

    // Mock data
    const contractors = [
        {
            id: '1',
            name: 'BuildRight Construction Ltd',
            email: 'contact@buildright.com',
            phone: '+234 801 234 5678',
            location: 'Lagos',
            specialization: 'Civil Engineering',
            rating: 4.8,
            assignedProjects: ['ICT Center Construction'],
            sections: [
                { project: 'ICT Center', section: 'Foundation & Grading' },
                { project: 'ICT Center', section: 'Structural Framework' }
            ],
            status: 'Active'
        },
        {
            id: '2',
            name: 'GreenEnergy Solutions',
            email: 'info@greenenergy.ng',
            phone: '+234 809 987 6543',
            location: 'Abuja',
            specialization: 'Renewable Energy',
            rating: 4.5,
            assignedProjects: ['Solar Mini-Grid'],
            sections: [
                { project: 'Solar Mini-Grid', section: 'Solar Panel Installation' }
            ],
            status: 'Active'
        },
        {
            id: '3',
            name: 'LabTech Nigeria',
            email: 'sales@labtech.ng',
            phone: '+234 705 555 1234',
            location: 'Port Harcourt',
            specialization: 'Equipment Supply',
            rating: 4.9,
            assignedProjects: [],
            sections: [],
            status: 'Available'
        }
    ];

    // Derive detailed project list (mock)
    const allProjects = ['All Projects', 'ICT Center Construction', 'Solar Mini-Grid'];

    const filteredContractors = contractors.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.specialization.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProject = selectedProject === 'All Projects' || c.assignedProjects.includes(selectedProject);
        return matchesSearch && matchesProject;
    });

    const openAssignModal = (contractor: Contractor) => {
        setSelectedContractor(contractor);
        setAssignModalOpen(true);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Contractors</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Manage contractors assigned to your projects.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Project Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            className="pl-9 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none appearance-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            {allProjects.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search contractors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2.5 w-full sm:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95">
                        <UserPlus className="h-4 w-4" />
                        <span className="hidden sm:inline">Invite</span>
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredContractors.map((contractor) => (
                    <div key={contractor.id} className="glass-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all group">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-14 w-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                                    {contractor.name.substring(0, 2).toUpperCase()}
                                </div>
                                <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate" title={contractor.name}>
                                    {contractor.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">
                                        {contractor.specialization}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-6">
                                <div className="flex items-center gap-2.5">
                                    <MapPin className="h-4 w-4 text-gray-400" /> {contractor.location}
                                </div>
                                {/* Section Info (Simplified) */}
                                <div className="flex items-center gap-2.5">
                                    <Briefcase className="h-4 w-4 text-gray-400" />
                                    {contractor.sections.length > 0 ? (
                                        <span>
                                            Assigned to <span className="font-bold text-gray-900 dark:text-white">{contractor.sections.length}</span> active section{contractor.sections.length !== 1 ? 's' : ''}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 italic">No active sections</span>
                                    )}
                                </div>
                                {contractor.sections.length > 0 && (
                                    <div className="pl-6 text-xs text-indigo-600 dark:text-indigo-400">
                                        • {contractor.sections[0].section}
                                        {contractor.sections.length > 1 && ` (+${contractor.sections.length - 1} more)`}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">
                                    <Star className="h-4 w-4 text-yellow-400 fill-current" /> {contractor.rating}
                                </div>
                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${contractor.status === 'Active'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                    }`}>
                                    {contractor.status}
                                </span>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                Last active: 2h ago
                            </span>
                            <button
                                onClick={() => openAssignModal(contractor)}
                                className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                            >
                                Assign Section
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <AssignSectionModal
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                contractorName={selectedContractor?.name}
            />
        </div>
    );
}
