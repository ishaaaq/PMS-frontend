
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConsultants, type Consultant } from '../services/consultants';
import { Search, Star, UserPlus, Filter } from 'lucide-react';
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

            <div className="p-8 text-center text-gray-500">Loading consultants...</div>

        );
    }

    return (

        <div className="p-1">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Consultants</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage and monitor consultant performance
                    </p>
                </div>
                <button
                    onClick={() => {/* TODO: Open invite modal */ }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                    <UserPlus className="h-5 w-5" />
                    Invite Consultant
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search consultants..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {/* Region Filter */}
                    <div>
                        <select
                            value={filterRegion}
                            onChange={(e) => setFilterRegion(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            {regions.map((region) => (
                                <option key={region} value={region}>
                                    {region === 'All' ? 'All Regions' : region}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {status === 'All' ? 'All Status' : status}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-5">
                    <p className="text-sm text-gray-500">Total Consultants</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{consultants.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-5">
                    <p className="text-sm text-gray-500">Active</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                        {consultants.filter(c => c.status === 'Active').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-5">
                    <p className="text-sm text-gray-500">Active Projects</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                        {consultants.reduce((sum, c) => sum + c.activeProjects, 0)}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-5">
                    <p className="text-sm text-gray-500">Avg Rating</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">
                        {(consultants.reduce((sum, c) => sum + c.rating, 0) / consultants.length).toFixed(1)} ⭐
                    </p>
                </div>
            </div>

            {/* Consultants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredConsultants.map((consultant) => (
                    <div
                        key={consultant.id}
                        onClick={() => navigate(`/dashboard/consultants/${consultant.id}`)}
                        className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <span className="text-indigo-700 font-semibold text-lg">
                                        {consultant.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{consultant.name}</h3>
                                    <p className="text-xs text-gray-500">{consultant.specialization}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${consultant.status === 'Active' ? 'bg-green-100 text-green-800' :
                                consultant.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {consultant.status}
                            </span>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-1 mb-4">
                            <p className="text-sm text-gray-600">{consultant.email}</p>
                            {consultant.phone && (
                                <p className="text-sm text-gray-600">{consultant.phone}</p>
                            )}
                            <p className="text-sm text-gray-500">{consultant.region}</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-200">
                            <div>
                                <p className="text-xs text-gray-500">Active Projects</p>
                                <p className="text-lg font-semibold text-gray-900">{consultant.activeProjects}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Completed</p>
                                <p className="text-lg font-semibold text-gray-900">{consultant.completedProjects}</p>
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <span className="text-sm text-gray-500">Performance</span>
                            <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-4 w-4 ${star <= Math.round(consultant.rating)
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                                <span className="ml-2 text-sm font-medium text-gray-900">
                                    {consultant.rating.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredConsultants.length === 0 && (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No consultants found</h3>
                    <p className="text-sm text-gray-500">
                        Try adjusting your search or filter criteria
                    </p>
                </div>
            )}
        </div>

    );
}
