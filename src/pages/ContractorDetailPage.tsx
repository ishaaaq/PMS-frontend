import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdminContractors, ZONE_LABELS } from '../services/adminContractors';
import type { AdminContractor, GeographicZone, ContractorStatus } from '../services/adminContractors';
import {
    ArrowLeft, Building2, MapPin, Phone, Mail, Calendar,
    Star, Briefcase, CheckCircle, Clock, Ban, TrendingUp,
    Award, FileText, MessageSquare, Edit, MoreVertical
} from 'lucide-react';

// Mock project history for the contractor
const MOCK_PROJECT_HISTORY = [
    { id: 'p1', name: 'Lagos-Ibadan Expressway Section B', status: 'COMPLETED', value: 450000000, startDate: '2024-03-15', endDate: '2025-08-20', rating: 4.8 },
    { id: 'p2', name: 'Abuja Solar Farm Installation', status: 'IN_PROGRESS', value: 280000000, startDate: '2025-06-01', endDate: null, rating: null },
    { id: 'p3', name: 'Port Harcourt Pipeline Rehabilitation', status: 'COMPLETED', value: 320000000, startDate: '2023-09-10', endDate: '2024-12-15', rating: 4.5 },
    { id: 'p4', name: 'Kano Water Treatment Facility', status: 'IN_PROGRESS', value: 180000000, startDate: '2025-10-01', endDate: null, rating: null },
];

export default function ContractorDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [contractor, setContractor] = useState<AdminContractor | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'reviews'>('overview');

    useEffect(() => {
        const fetchContractor = async () => {
            setIsLoading(true);
            try {
                const contractors = await getAdminContractors();
                const found = contractors.find(c => c.id === id);
                setContractor(found || null);
            } catch (error) {
                console.error('Failed to fetch contractor', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchContractor();
    }, [id]);

    const getStatusBadge = (status: ContractorStatus) => {
        switch (status) {
            case 'ACTIVE':
                return <span className="px-3 py-1.5 text-sm font-bold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Active</span>;
            case 'PENDING':
                return <span className="px-3 py-1.5 text-sm font-bold rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center gap-1"><Clock className="h-4 w-4" /> Pending</span>;
            case 'SUSPENDED':
                return <span className="px-3 py-1.5 text-sm font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1"><Ban className="h-4 w-4" /> Suspended</span>;
        }
    };

    const getZoneBadge = (zone: GeographicZone) => {
        const colors: Record<string, string> = {
            'NORTH_WEST': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            'NORTH_EAST': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            'NORTH_CENTRAL': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
            'SOUTH_WEST': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
            'SOUTH_EAST': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            'SOUTH_SOUTH': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        };
        return <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${colors[zone]} flex items-center gap-1`}><MapPin className="h-4 w-4" /> {ZONE_LABELS[zone]}</span>;
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />);
            } else if (i === fullStars && hasHalf) {
                stars.push(<Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400 opacity-50" />);
            } else {
                stars.push(<Star key={i} className="h-5 w-5 text-gray-300 dark:text-gray-600" />);
            }
        }
        return stars;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>)}
                </div>
            </div>
        );
    }

    if (!contractor) {
        return (
            <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Contractor Not Found</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">The contractor you're looking for doesn't exist.</p>
                <button onClick={() => navigate('/dashboard/contractors')} className="px-4 py-2 bg-ptdf-primary text-white rounded-lg">
                    Back to Directory
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate('/dashboard/contractors')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Directory</span>
            </button>

            {/* Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="h-20 w-20 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            {contractor.logo ? (
                                <img src={contractor.logo} alt="" className="h-full w-full rounded-xl object-cover" />
                            ) : (
                                <Building2 className="h-10 w-10 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{contractor.companyName}</h1>
                                {getStatusBadge(contractor.status)}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{contractor.registrationNumber}</p>
                            <div className="flex flex-wrap items-center gap-4 mt-3">
                                {getZoneBadge(contractor.zone)}
                                <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                                    <Mail className="h-4 w-4 text-gray-400" /> {contractor.email}
                                </span>
                                <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                                    <Phone className="h-4 w-4 text-gray-400" /> {contractor.phone}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" /> Message
                        </button>
                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                            <Edit className="h-4 w-4" /> Edit
                        </button>
                        <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <MoreVertical className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Projects</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{contractor.projectCount}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{contractor.activeProjects} active, {contractor.completedProjects} completed</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{contractor.rating > 0 ? contractor.rating.toFixed(1) : '-'}</p>
                        {contractor.rating > 0 && <div className="flex">{renderStars(contractor.rating)}</div>}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{contractor.totalReviews} reviews</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(1230000000)}</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">+15% from last year</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{new Date(contractor.joinedAt).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{Math.floor((Date.now() - new Date(contractor.joinedAt).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex -mb-px">
                        {(['overview', 'projects', 'reviews'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-4 text-sm font-medium border-b-2 capitalize ${activeTab === tab
                                    ? 'border-ptdf-primary text-ptdf-primary'
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
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Specializations</h3>
                                <div className="flex flex-wrap gap-2">
                                    {contractor.specializations.map(spec => (
                                        <span key={spec} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm flex items-center gap-1">
                                            <Award className="h-4 w-4 text-ptdf-primary" /> {spec}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">On-Time Delivery</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 rounded-full" style={{ width: '92%' }}></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">92%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Quality Score</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '88%' }}></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">88%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Communication</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-purple-500 rounded-full" style={{ width: '95%' }}></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">95%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Projects Tab */}
                    {activeTab === 'projects' && (
                        <div className="space-y-4">
                            {MOCK_PROJECT_HISTORY.map(project => (
                                <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                                            <FileText className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{project.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(project.startDate).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}
                                                {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(project.value)}</p>
                                            {project.rating && (
                                                <div className="flex items-center gap-1 justify-end mt-1">
                                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">{project.rating}</span>
                                                </div>
                                            )}
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${project.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                            {project.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-4">
                            {contractor.totalReviews === 0 ? (
                                <div className="text-center py-8">
                                    <Star className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">No reviews yet</p>
                                </div>
                            ) : (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                                                    {['AA', 'BO', 'CR'][i - 1]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{['Abubakar Aliyu', 'Blessing Okonkwo', 'Charles Remi'][i - 1]}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Consultant • {['2 weeks ago', '1 month ago', '3 months ago'][i - 1]}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">{renderStars([4.8, 4.5, 5][i - 1])}</div>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 ml-13">
                                            {['Excellent work on the highway project. Delivered on time with high quality standards.', 'Good communication throughout the project. Minor delays but handled professionally.', 'Outstanding performance. Would highly recommend for future projects.'][i - 1]}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
