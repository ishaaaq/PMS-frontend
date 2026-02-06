import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin,
    Calendar,
    Briefcase,
    Plus,
    UserPlus,
    MoreVertical,
    DollarSign,
    AlertTriangle,
    FileText,
    ChevronLeft
} from 'lucide-react';
import AssignSectionModal from '../../components/consultant/AssignSectionModal';


export default function ConsultantProjectDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('sections');
    const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate data loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // Mock Project Data
    const project = {
        id: id,
        title: 'ICT Center Construction',
        location: 'Lagos, Nigeria',
        status: 'Ongoing',
        progress: 45,
        startDate: '2025-01-10',
        endDate: '2025-12-20',
        budget: '₦120,000,000',
        description: 'Construction of a state-of-the-art ICT center with 500 workstations.',
        contractors: [
            { id: 'c1', name: 'BuildRight Construction', role: 'Civil', email: 'info@buildright.com' },
            { id: 'c2', name: 'GreenEnergy Solutions', role: 'Electrical', email: 'contact@green.ng' }
        ],
        sections: [
            {
                id: 's1',
                title: 'Foundation & Grading',
                contractor: 'BuildRight Construction',
                budget: '₦25,000,000',
                status: 'Completed',
                progress: 100
            },
            {
                id: 's2',
                title: 'Structural Framework',
                contractor: 'BuildRight Construction',
                budget: '₦45,000,000',
                status: 'In Progress',
                progress: 35
            },
            {
                id: 's3',
                title: 'Electrical Wiring',
                contractor: 'Unassigned',
                budget: '₦15,000,000',
                status: 'Pending',
                progress: 0
            }
        ]
    };

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>)}
                </div>
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate('/dashboard/consultant/projects')}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back to Projects
                </button>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {project.location}</span>
                            <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> {project.startDate} - {project.endDate}</span>
                            <span className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">
                                {project.status}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <FileText className="h-4 w-4 mr-2" /> View Reports
                        </button>
                        <button
                            onClick={() => navigate(`/dashboard/consultant/projects/${id}/sections/new`)}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Create Section
                        </button>
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Budget</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{project.budget}</p>
                </div>
                <div className="glass-card p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Project Progress</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{project.progress}%</p>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Contractors Active</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex -space-x-2">
                            {project.contractors.map((c, i) => (
                                <div key={i} className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-400" title={c.name}>
                                    {c.name.charAt(0)}
                                </div>
                            ))}
                        </div>
                        <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center">
                            <UserPlus className="h-3 w-3 mr-1" /> Invite
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Tabs */}
            <div className="glass-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex -mb-px">
                        {['Sections', 'Contractors', 'Submissions'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.toLowerCase()
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'sections' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Project Sections</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manage work breakdown and contractor assignments.</p>
                            </div>

                            <div className="grid gap-4">
                                {project.sections.map((section) => (
                                    <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors bg-gray-50/50 dark:bg-gray-800/50">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-gray-900 dark:text-white">{section.title}</h4>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${section.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                                        section.status === 'Pending' ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400' :
                                                            'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                        }`}>
                                                        {section.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center"><DollarSign className="h-3 w-3 mr-1" /> {section.budget}</span>
                                                    <span className="flex items-center">
                                                        <Briefcase className="h-3 w-3 mr-1" />
                                                        {section.contractor === 'Unassigned' ? (
                                                            <span className="text-orange-600 dark:text-orange-400 font-medium flex items-center">
                                                                <AlertTriangle className="h-3 w-3 mr-1" /> Unassigned
                                                            </span>
                                                        ) : (
                                                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">{section.contractor}</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-24 hidden md:block">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-gray-500 dark:text-gray-400">Progress</span>
                                                        <span className="text-gray-700 dark:text-gray-300">{section.progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${section.progress}%` }}></div>
                                                    </div>
                                                </div>

                                                {section.contractor === 'Unassigned' ? (
                                                    <button
                                                        onClick={() => setIsCreateSectionOpen(true)}
                                                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700"
                                                    >
                                                        Assign Contractor
                                                    </button>
                                                ) : (
                                                    <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        Manage
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'contractors' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Project Contractors</h3>
                                <button className="flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
                                    <UserPlus className="h-4 w-4 mr-2" /> Invite Contractor
                                </button>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {project.contractors.map((contractor) => (
                                    <div key={contractor.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-start bg-gray-50/50 dark:bg-gray-800/50">
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{contractor.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{contractor.role}</p>
                                            <p className="text-xs text-gray-400 mt-1">{contractor.email}</p>
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Creating/Assigning Sections */}
            <AssignSectionModal
                isOpen={isCreateSectionOpen}
                onClose={() => setIsCreateSectionOpen(false)}
                projectId={id}
                contractorName=""
            />
        </div>
    );
}
