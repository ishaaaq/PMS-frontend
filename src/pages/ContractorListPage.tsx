
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContractors, type Contractor } from '../services/contractors';
import { Search, Star, UserPlus, Filter, Building2, Mail, Phone, MoreVertical, Bell } from 'lucide-react';
import { cn } from '../lib/utils';
import { useRoleStore } from '../services/mockRole';
import SendNotificationModal from '../components/dashboard/SendNotificationModal';

export default function ContractorListPage() {
    const [contractors, setContractors] = useState<Contractor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
    const navigate = useNavigate();
    const { currentRole } = useRoleStore();

    useEffect(() => {
        getContractors().then((data) => {
            setContractors(data);
            setLoading(false);
        });
    }, []);

    const filteredContractors = contractors.filter((contractor) => {
        const matchesSearch = contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contractor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contractor.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || contractor.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            "h-4 w-4",
                            i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        )}
                    />
                ))}
                <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
            </div>
        );
    };

    const getStatusBadge = (status: Contractor['status']) => {
        const styles = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            pending: 'bg-yellow-100 text-yellow-800',
        };
        return (
            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium uppercase", styles[status])}>
                {status}
            </span>
        );
    };

    const handleSendNotification = (contractor: Contractor) => {
        setSelectedContractor(contractor);
        setIsNotificationModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        {currentRole === 'CONSULTANT' ? 'My Contractors' : 'All Contractors'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        {currentRole === 'CONSULTANT'
                            ? 'Contractors assigned to your projects'
                            : 'Manage and monitor all contractors in the system'}
                    </p>
                </div>
                {currentRole === 'ADMIN' && (
                    <div className="mt-4 md:mt-0">
                        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-all">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invite Contractor
                        </button>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search contractors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Contractors</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{contractors.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active</p>
                    <p className="mt-2 text-3xl font-bold text-green-600">{contractors.filter(c => c.status === 'active').length}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Approval</p>
                    <p className="mt-2 text-3xl font-bold text-yellow-600">{contractors.filter(c => c.status === 'pending').length}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Rating</p>
                    <p className="mt-2 text-3xl font-bold text-purple-600">
                        {(contractors.reduce((acc, c) => acc + c.rating, 0) / contractors.filter(c => c.rating > 0).length || 0).toFixed(1)}
                    </p>
                </div>
            </div>

            {/* Contractors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContractors.map((contractor) => (
                    <div
                        key={contractor.id}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                        {contractor.name.charAt(0)}
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">{contractor.name}</h3>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Building2 className="h-3 w-3 mr-1" />
                                            {contractor.company}
                                        </div>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                    {contractor.email}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                    {contractor.phone}
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                {getStatusBadge(contractor.status)}
                                {contractor.rating > 0 && renderStars(contractor.rating)}
                            </div>

                            {contractor.assignedProjectName && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs font-medium text-gray-500 uppercase">Current Project</p>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{contractor.assignedProjectName}</p>
                                </div>
                            )}

                            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                                <button
                                    onClick={() => navigate(`/dashboard/contractors/${contractor.id}`)}
                                    className="flex-1 px-3 py-2 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                                >
                                    View Details
                                </button>
                                {currentRole === 'CONSULTANT' && (
                                    <button
                                        onClick={() => handleSendNotification(contractor)}
                                        className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        title="Send Notification"
                                    >
                                        <Bell className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                <span>{contractor.projectsCompleted} completed</span>
                                <span>{contractor.activeProjects} active</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredContractors.length === 0 && (
                <div className="text-center py-12">
                    <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No contractors found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter.</p>
                </div>
            )}

            {/* Send Notification Modal */}
            {isNotificationModalOpen && selectedContractor && (
                <SendNotificationModal
                    contractor={selectedContractor}
                    onClose={() => {
                        setIsNotificationModalOpen(false);
                        setSelectedContractor(null);
                    }}
                    onSend={(data: { contractorId: string; type: string; subject: string; message: string }) => {
                        console.log('Notification sent:', data);
                        setIsNotificationModalOpen(false);
                        setSelectedContractor(null);
                        alert('Notification sent successfully!');
                    }}
                />
            )}
        </div>
    );
}
