
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, type Project, ProjectStatus } from '../services/projects';
import { ChevronRight, ArrowLeft, Calendar, MapPin, DollarSign, Clock, Users, ShieldCheck, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import MilestonesTab from '../components/dashboard/MilestonesTab';
import AnalyticsTab from '../components/dashboard/AnalyticsTab';
import PersonnelTab from '../components/dashboard/PersonnelTab';
import SubmissionHistoryTab from '../components/dashboard/SubmissionHistoryTab';
import CommentsSection from '../components/dashboard/CommentsSection';
import type { LucideIcon } from 'lucide-react';

interface DetailRowProps {
    label: string;
    value: string | React.ReactNode;
    icon?: LucideIcon;
}

export default function ProjectDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Details');

    useEffect(() => {
        if (id) {
            getProject(id).then((data) => {
                console.log('ProjectDetailsPage: Loaded project', data);
                setProject(data);
                setLoading(false);
            });
        }
    }, [id]);


    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>)}
                    </div>
                </div>
            </div>
        );
    }

    if (!project) return <div className="p-8 text-center text-red-500">Project not found</div>;

    const tabs = ['Details', 'Milestones', 'Submissions', 'Personnel', 'Analytics'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <button onClick={() => navigate('/dashboard/projects')} className="hover:text-gray-900 dark:hover:text-white flex items-center transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </button>
                    <ChevronRight className="h-4 w-4 mx-2" />
                    <span className="font-medium text-gray-900 dark:text-white">{project.title}</span>
                </div>

                <div className="md:flex md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{project.title}</h2>
                            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">Admin View</span>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4 md:mt-0">
                        <button
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-100 dark:shadow-none flex items-center transition-all active:scale-95"
                            onClick={() => alert('Disbursement Authorized!')}
                        >
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Authorize Disbursement
                        </button>
                        <button className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95">
                            Manage Project
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700 mt-6">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    activeTab === tab
                                        ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500',
                                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Details Content */}
            {activeTab === 'Details' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-card rounded-lg p-6">
                            <div className="flex items-center mb-4">
                                <FileTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Description</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                {project.description}
                            </p>

                            <div className="mt-8 border-t border-gray-100 dark:border-gray-700/50 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                                <DetailRow label="Department" value={project.department || 'N/A'} icon={Users} />
                                <DetailRow label="Location" value={`${project.lga}, ${project.state}`} icon={MapPin} />

                                <div className="sm:col-span-2 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Progress</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{project.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                    </div>
                                </div>

                                <DetailRow
                                    label="Status"
                                    value={
                                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                                            project.status === ProjectStatus.ACTIVE ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
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
                        <div className="glass-card rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Project gallery</h3>
                                <a href="#" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">Full gallery</a>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {project.gallery && project.gallery.length > 0 ? (
                                    project.gallery.map((img, idx) => (
                                        <img key={idx} src={img} alt="Project" className="h-24 w-full object-cover rounded-md" />
                                    ))
                                ) : (
                                    <div className="col-span-2 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 text-sm">No Images</div>
                                )}
                            </div>
                        </div>

                        <CommentsSection projectId={id!} />

                        {/* Admin Action: Rate Consultant */}
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 shadow-sm border border-indigo-100 dark:border-indigo-500/20 rounded-lg p-6">
                            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 uppercase mb-4 flex items-center">
                                <Star className="h-4 w-4 mr-2 text-indigo-500" /> Rate Consultant Performance
                            </h3>
                            <div className="flex gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button key={s} className="hover:scale-110 transition-transform">
                                        <Star className="h-6 w-6 text-indigo-200 dark:text-indigo-800 hover:text-yellow-400 dark:hover:text-yellow-400 fill-current" />
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-indigo-400 dark:text-indigo-300/80 font-medium">Evaluation is required upon project completion to maintain consultant quality standards.</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'Milestones' && (
                <div className="max-w-4xl">
                    <MilestonesTab projectId={id || '1'} />
                </div>
            )}

            {activeTab === 'Submissions' && (
                <SubmissionHistoryTab projectId={id!} />
            )}

            {activeTab === 'Analytics' && (
                <AnalyticsTab project={project} />
            )}

            {/* Personnel Tab */}
            {activeTab === 'Personnel' && (
                <PersonnelTab project={project} />
            )}
        </div>
    );
}

function DetailRow({ label, value, icon: Icon }: DetailRowProps) {
    return (
        <div className="flex items-start">
            {Icon && <Icon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />}
            <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">{value}</dd>
            </div>
        </div>
    );
}

function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
    )
}
