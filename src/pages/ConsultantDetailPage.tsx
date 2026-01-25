
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConsultant, type Consultant } from '../services/consultants';
import { ArrowLeft, Mail, Phone, MapPin, Star, Briefcase, Calendar, CheckCircle, MessageSquare, TrendingUp, Users, User, Building } from 'lucide-react';

export default function ConsultantDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [consultant, setConsultant] = useState<Consultant | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview');

    useEffect(() => {
        if (id) {
            getConsultant(id).then((data) => {
                setConsultant(data);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500 dark:text-gray-400 animate-pulse">Loading consultant details...</div>;
    }

    if (!consultant) {
        return (
            <div className="text-center py-12">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full inline-block mb-4">
                    <User className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Consultant Not Found</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">The consultant you're looking for doesn't exist.</p>
                <button onClick={() => navigate('/dashboard/consultants')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Back to Directory
                </button>
            </div>
        );
    }

    const tabs = ['Overview', 'Projects', 'Analytics', 'Personnel'];

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate('/dashboard/consultants')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Directory</span>
            </button>

            {/* Header Card */}
            <div className="glass-card rounded-xl p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="h-20 w-20 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 text-indigo-700 dark:text-indigo-400 font-bold text-2xl">
                            {consultant.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{consultant.name}</h1>
                                <span className={`px-3 py-1.5 text-sm font-bold rounded-full flex items-center gap-1 ${consultant.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    consultant.status === 'On Leave' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                    {consultant.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{consultant.specialization}</p>
                            <div className="flex flex-wrap items-center gap-4 mt-3">
                                <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                                    <MapPin className="h-4 w-4 text-gray-400" /> {consultant.region}
                                </span>
                                <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                                    <Mail className="h-4 w-4 text-gray-400" /> {consultant.email}
                                </span>
                                {consultant.phone && (
                                    <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                                        <Phone className="h-4 w-4 text-gray-400" /> {consultant.phone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" /> Message
                        </button>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium">
                            <Briefcase className="h-4 w-4" /> Assign Project
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Projects</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{consultant.activeProjects}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Currently managed</p>
                </div>
                <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{consultant.completedProjects}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total delivered</p>
                </div>
                <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{consultant.rating.toFixed(1)}</p>
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= Math.round(consultant.rating)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300 dark:text-gray-600'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Based on performance</p>
                </div>
                <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Joined</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {new Date(consultant.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {Math.floor((Date.now() - new Date(consultant.joinedDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years ago
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="glass-card rounded-xl">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex -mb-px px-6">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-6 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === tab
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'Overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Professional Performance</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Project Quality</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '92%' }}></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">92%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Timeliness</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 rounded-full" style={{ width: '88%' }}></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">88%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Communication</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-yellow-500 rounded-full" style={{ width: '95%' }}></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">95%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Organizational Info</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</label>
                                        <p className="mt-1 text-gray-900 dark:text-white flex items-center gap-2">
                                            <Building className="h-4 w-4 text-gray-400" />
                                            {consultant.company}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</label>
                                        <p className="mt-1 text-gray-900 dark:text-white">{consultant.department}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Specialization</label>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                {consultant.specialization}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Projects' && (
                        <div className="text-center py-8">
                            <Briefcase className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No projects currently assigned to this view.</p>
                        </div>
                    )}

                    {activeTab === 'Analytics' && (
                        <div className="text-center py-8">
                            <TrendingUp className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Detailed analytics are being processed.</p>
                        </div>
                    )}

                    {activeTab === 'Personnel' && (
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No personnel records available.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
