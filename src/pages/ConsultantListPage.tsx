
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConsultants, type Consultant } from '../services/consultants';
import { Search, Star, UserPlus, Filter, CheckCircle, Briefcase, MapPin, Mail, ChevronRight } from 'lucide-react';
// import DashboardLayout from '../layouts/DashboardLayout';

export default function ConsultantListPage() {
    const navigate = useNavigate();
    const [consultants, setConsultants] = useState<Consultant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRegion, setFilterRegion] = useState<string>('All');
    const [filterStatus, setFilterStatus] = useState<string>('All');

    useEffect(() => {
        getConsultants().then((data) => {
            setConsultants(data);
            setLoading(false);
        });
    }, []);

    const filteredConsultants = consultants.filter((consultant) => {
        const matchesSearch = consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            consultant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            consultant.specialization?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRegion = filterRegion === 'All' || consultant.region === filterRegion;
        const matchesStatus = filterStatus === 'All' || consultant.status === filterStatus;

        return matchesSearch && matchesRegion && matchesStatus;
    });

    const regions = ['All', ...Array.from(new Set(consultants.map(c => c.region)))];
    const statuses = ['All', 'Active', 'Inactive', 'On Leave'];


    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>)}
                </div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>)}
                </div>
            </div>
        );
    }


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Consultants Directory</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage and monitor consultant performance
                    </p>
                </div>
                <button
                    onClick={() => {/* TODO: Open invite modal */ }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                >
                    <UserPlus className="h-5 w-5" />
                    Invite Consultant
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-400">
                        <UserPlus className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{consultants.length}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Total Consultants</p>
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl shadow-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {consultants.filter(c => c.status === 'Active').length}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Active</p>
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl shadow-sm text-blue-600 dark:text-blue-400">
                        <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {consultants.reduce((sum, c) => sum + c.activeProjects, 0)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Active Projects</p>
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl shadow-sm text-yellow-600 dark:text-yellow-400">
                        <Star className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {(consultants.reduce((sum, c) => sum + c.rating, 0) / consultants.length).toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Avg Rating</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 rounded-2xl">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative group">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search consultants..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
                        />
                    </div>

                    {/* Region Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400 hidden sm:block" />
                        <select
                            value={filterRegion}
                            onChange={(e) => setFilterRegion(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all cursor-pointer hover:bg-white dark:hover:bg-gray-800"
                        >
                            {regions.map((region) => (
                                <option key={region} value={region}>
                                    {region === 'All' ? 'All Regions' : region}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all cursor-pointer hover:bg-white dark:hover:bg-gray-800"
                    >
                        {statuses.map((status) => (
                            <option key={status} value={status}>
                                {status === 'All' ? 'All Status' : status}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Consultants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredConsultants.map((consultant) => (
                    <div
                        key={consultant.id}
                        onClick={() => navigate(`/dashboard/consultants/${consultant.id}`)}
                        className="glass-card rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                    >
                        {/* Hover Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-semibold text-lg shadow-sm">
                                        {consultant.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {consultant.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{consultant.specialization}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${consultant.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    consultant.status === 'On Leave' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                    {consultant.status}
                                </span>
                            </div>

                            {/* Info Rows */}
                            <div className="space-y-3 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-500">
                                        <MapPin className="h-3.5 w-3.5" />
                                    </div>
                                    <span>{consultant.region}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-500">
                                        <Briefcase className="h-3.5 w-3.5" />
                                    </div>
                                    <span>
                                        <span className="font-semibold">{consultant.activeProjects + consultant.completedProjects}</span> projects
                                        (<span className="text-green-600 dark:text-green-400">{consultant.activeProjects} active</span>)
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="p-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500">
                                        <Star className="h-3.5 w-3.5 fill-current" />
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white">{consultant.rating.toFixed(1)}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                                <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {consultant.email}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/consultants/${consultant.id}`); }}
                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300"
                                >
                                    View Profile <ChevronRight className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredConsultants.length === 0 && (
                <div className="glass-card rounded-2xl p-12 text-center">
                    <Filter className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No consultants found</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Try adjusting your search or filter criteria
                    </p>
                </div>
            )}
        </div>
    );
}
