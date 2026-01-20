
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, type Project, ProjectStatus } from '../services/projects';
import { ChevronRight, ArrowLeft, Calendar, MapPin, DollarSign, Clock, Users } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ProjectDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Details');

    useEffect(() => {
        if (id) {
            getProject(id).then((data) => {
                setProject(data);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading project details...</div>;
    if (!project) return <div className="p-8 text-center text-red-500">Project not found</div>;

    const tabs = ['Details', 'Milestones', 'Personnel', 'Analytics'];

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center text-sm text-gray-500 mb-4">
                    <button onClick={() => navigate('/dashboard/projects')} className="hover:text-gray-900 flex items-center">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </button>
                    <ChevronRight className="h-4 w-4 mx-2" />
                    <span className="font-medium text-gray-900">{project.title}</span>
                </div>

                <div className="md:flex md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
                    </div>
                    <div>
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-indigo-700">
                            Manage Project
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mt-6">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    activeTab === tab
                                        ? 'border-gray-900 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Details Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center mb-4">
                            <FileTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <h3 className="text-lg font-medium text-gray-900">Description</h3>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {project.description}
                        </p>

                        <div className="mt-8 border-t border-gray-100 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                            <DetailRow label="Department" value={project.department || 'N/A'} icon={Users} />
                            <DetailRow label="Location" value={`${project.lga}, ${project.state}`} icon={MapPin} />

                            <div className="sm:col-span-2 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Progress</span>
                                    <span className="font-medium">{project.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                </div>
                            </div>

                            <DetailRow
                                label="Status"
                                value={
                                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                                        project.status === ProjectStatus.ONGOING ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                                    )}>
                                        {project.status}
                                    </span>
                                }
                                icon={Clock}
                            />

                            <DetailRow label="Approved Budget" value={`₦${project.approvedBudget?.toLocaleString()}`} icon={DollarSign} />
                            <DetailRow label="Amount Spent" value={`₦${project.amountSpent?.toLocaleString()}`} icon={DollarSign} />

                            <DetailRow label="Start Date" value={project.startDate} icon={Calendar} />
                            <DetailRow label="End Date" value={project.endDate} icon={Calendar} />
                        </div>
                    </div>
                </div>

                {/* Right Column: Gallery & Comments */}
                <div className="space-y-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Project gallery</h3>
                            <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500">Full gallery</a>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {project.gallery && project.gallery.length > 0 ? (
                                project.gallery.map((img, idx) => (
                                    <img key={idx} src={img} alt="Project" className="h-24 w-full object-cover rounded-md" />
                                ))
                            ) : (
                                <div className="col-span-2 h-24 bg-gray-100 rounded-flex items-center justify-center text-gray-400 text-sm flex">No Images</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Comments</h3>
                            <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500">All comments</a>
                        </div>
                        {/* Mock Comment */}
                        <div className="space-y-4">
                            <div className="flex space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">IA</div>
                                </div>
                                <div>
                                    <div className="text-sm">
                                        <span className="font-medium text-gray-900">Ishaq Abdullahi</span>
                                        <span className="text-gray-500 ml-2">2 min ago</span>
                                    </div>
                                    <div className="mt-1 text-sm text-gray-700">
                                        <p>Great progress on the foundation work! Ensure safety gear compliance.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value, icon: Icon }: any) {
    return (
        <div className="flex items-start">
            {Icon && <Icon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />}
            <div>
                <dt className="text-sm font-medium text-gray-500">{label}</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">{value}</dd>
            </div>
        </div>
    );
}

function FileTextIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
    )
}
