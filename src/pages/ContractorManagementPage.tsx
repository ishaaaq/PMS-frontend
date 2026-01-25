import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getAdminContractors, getContractorStats, inviteContractor,
    ZONE_LABELS
} from '../services/adminContractors';
import type { AdminContractor, GeographicZone, ContractorStatus, ContractorStats, InviteContractorData } from '../services/adminContractors';
import {
    Search, Filter, Users, CheckCircle, Clock, Ban,
    Star, MoreVertical, Eye, FolderOpen, MessageSquare,
    UserPlus, X, ChevronLeft, ChevronRight,
    ArrowUpDown, ArrowUp, ArrowDown, LayoutGrid, List,
    MapPin, Briefcase, Download, Trash2, Mail, Edit,
    ThumbsUp, ThumbsDown, Info
} from 'lucide-react';

type RatingFilter = 'ALL' | '5' | '4+' | '3+' | 'BELOW3';
type SortField = 'companyName' | 'zone' | 'projectCount' | 'rating' | 'status' | 'lastActiveAt';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'cards';

export default function ContractorManagementPage() {
    const navigate = useNavigate();
    const [contractors, setContractors] = useState<AdminContractor[]>([]);
    const [stats, setStats] = useState<ContractorStats>({ total: 0, active: 0, pending: 0, suspended: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [zoneFilter, setZoneFilter] = useState<GeographicZone | 'ALL'>('ALL');
    const [statusFilter, setStatusFilter] = useState<ContractorStatus | 'ALL'>('ALL');
    const [ratingFilter, setRatingFilter] = useState<RatingFilter>('ALL');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [sortField, setSortField] = useState<SortField>('companyName');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [editingContractor, setEditingContractor] = useState<AdminContractor | null>(null);
    const [approvalContractor, setApprovalContractor] = useState<AdminContractor | null>(null);
    const [hoveredRatingId, setHoveredRatingId] = useState<string | null>(null);
    const itemsPerPage = viewMode === 'table' ? 8 : 6;

    // Load saved filters from localStorage
    useEffect(() => {
        const savedFilters = localStorage.getItem('contractorFilters');
        if (savedFilters) {
            try {
                const filters = JSON.parse(savedFilters);
                if (filters.zoneFilter) setZoneFilter(filters.zoneFilter);
                if (filters.statusFilter) setStatusFilter(filters.statusFilter);
                if (filters.ratingFilter) setRatingFilter(filters.ratingFilter);
                if (filters.viewMode) setViewMode(filters.viewMode);
                if (filters.sortField) setSortField(filters.sortField);
                if (filters.sortDirection) setSortDirection(filters.sortDirection);
            } catch (e) {
                console.error('Failed to load saved filters', e);
            }
        }
    }, []);

    // Save filters to localStorage when they change
    useEffect(() => {
        const filters = { zoneFilter, statusFilter, ratingFilter, viewMode, sortField, sortDirection };
        localStorage.setItem('contractorFilters', JSON.stringify(filters));
    }, [zoneFilter, statusFilter, ratingFilter, viewMode, sortField, sortDirection]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await getAdminContractors();
                setContractors(data);
                setStats(getContractorStats(data));
            } catch (error) {
                console.error('Failed to fetch contractors', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-50" />;
        return sortDirection === 'asc'
            ? <ArrowUp className="h-3 w-3" />
            : <ArrowDown className="h-3 w-3" />;
    };

    const filteredAndSortedContractors = useMemo(() => {
        const result = contractors.filter(c => {
            const matchesSearch = c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesZone = zoneFilter === 'ALL' || c.zone === zoneFilter;
            const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
            let matchesRating = true;
            if (ratingFilter === '5') matchesRating = c.rating >= 4.8;
            else if (ratingFilter === '4+') matchesRating = c.rating >= 4;
            else if (ratingFilter === '3+') matchesRating = c.rating >= 3;
            else if (ratingFilter === 'BELOW3') matchesRating = c.rating > 0 && c.rating < 3;
            return matchesSearch && matchesZone && matchesStatus && matchesRating;
        });

        // Sort
        result.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'companyName':
                    comparison = a.companyName.localeCompare(b.companyName);
                    break;
                case 'zone':
                    comparison = a.zone.localeCompare(b.zone);
                    break;
                case 'projectCount':
                    comparison = a.projectCount - b.projectCount;
                    break;
                case 'rating':
                    comparison = a.rating - b.rating;
                    break;
                case 'status':
                    comparison = a.status.localeCompare(b.status);
                    break;
                case 'lastActiveAt':
                    comparison = new Date(a.lastActiveAt).getTime() - new Date(b.lastActiveAt).getTime();
                    break;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [contractors, searchQuery, zoneFilter, statusFilter, ratingFilter, sortField, sortDirection]);

    const paginatedContractors = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedContractors.slice(start, start + itemsPerPage);
    }, [filteredAndSortedContractors, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredAndSortedContractors.length / itemsPerPage);

    const resetFilters = () => {
        setSearchQuery('');
        setZoneFilter('ALL');
        setStatusFilter('ALL');
        setRatingFilter('ALL');
        setCurrentPage(1);
        setSelectedIds(new Set());
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedContractors.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedContractors.map(c => c.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const clearSelection = () => setSelectedIds(new Set());

    const handleBulkAction = (action: 'suspend' | 'message' | 'delete') => {
        const count = selectedIds.size;
        switch (action) {
            case 'suspend':
                alert(`Suspending ${count} contractor(s)...`);
                break;
            case 'message':
                alert(`Sending message to ${count} contractor(s)...`);
                break;
            case 'delete':
                if (confirm(`Are you sure you want to delete ${count} contractor(s)?`)) {
                    alert(`Deleting ${count} contractor(s)...`);
                }
                break;
        }
        setSelectedIds(new Set());
    };

    const formatRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
    };

    // Mock rating breakdown data
    const getRatingBreakdown = (contractorId: string) => {
        // In real app, this would come from API
        const hash = contractorId.charCodeAt(1) || 5;
        return {
            quality: Math.min(5, 3.5 + (hash % 20) / 10),
            timeliness: Math.min(5, 3.8 + (hash % 15) / 10),
            communication: Math.min(5, 4.0 + (hash % 12) / 10),
        };
    };

    const handleApprove = (contractor: AdminContractor, approved: boolean, notes?: string) => {
        const newStatus = approved ? 'ACTIVE' : 'SUSPENDED';
        setContractors(prev => prev.map(c =>
            c.id === contractor.id ? { ...c, status: newStatus as ContractorStatus } : c
        ));
        setStats(getContractorStats(contractors.map(c =>
            c.id === contractor.id ? { ...c, status: newStatus as ContractorStatus } : c
        )));
        setApprovalContractor(null);
        alert(`Contractor ${approved ? 'approved' : 'rejected'}${notes ? ': ' + notes : ''}`);
    };

    const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;
        const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Star key={i} className={`${sizeClass} text-yellow-400 fill-yellow-400`} />);
            } else if (i === fullStars && hasHalf) {
                stars.push(<Star key={i} className={`${sizeClass} text-yellow-400 fill-yellow-400 opacity-50`} />);
            } else {
                stars.push(<Star key={i} className={`${sizeClass} text-gray-300 dark:text-gray-600`} />);
            }
        }
        return stars;
    };

    const getStatusBadge = (status: ContractorStatus) => {
        switch (status) {
            case 'ACTIVE':
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>;
            case 'PENDING':
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</span>;
            case 'SUSPENDED':
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Suspended</span>;
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
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[zone]}`}>{ZONE_LABELS[zone]}</span>;
    };

    const handleViewProfile = (contractorId: string) => {
        setActionMenuOpen(null);
        navigate(`/dashboard/contractors/${contractorId}`);
    };

    const handleEdit = (contractor: AdminContractor) => {
        setActionMenuOpen(null);
        setEditingContractor(contractor);
    };

    const exportToCSV = () => {
        const headers = ['Company Name', 'Registration Number', 'Email', 'Phone', 'Zone', 'Status', 'Rating', 'Reviews', 'Total Projects', 'Active Projects', 'Specializations', 'Last Active', 'Joined'];
        const rows = filteredAndSortedContractors.map(c => [
            c.companyName,
            c.registrationNumber,
            c.email,
            c.phone,
            ZONE_LABELS[c.zone],
            c.status,
            c.rating.toFixed(1),
            c.totalReviews.toString(),
            c.projectCount.toString(),
            c.activeProjects.toString(),
            c.specializations.join('; '),
            new Date(c.lastActiveAt).toLocaleDateString('en-NG'),
            new Date(c.joinedAt).toLocaleDateString('en-NG'),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `contractors_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>)}
                </div>
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contractor Directory</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and monitor all registered contractors</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={exportToCSV}
                        disabled={filteredAndSortedContractors.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Export filtered contractors to CSV"
                    >
                        <Download className="h-5 w-5" />
                        Export CSV
                    </button>
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-ptdf-primary hover:bg-ptdf-primary/90 text-white font-medium rounded-lg transition-colors"
                    >
                        <UserPlus className="h-5 w-5" />
                        Invite Contractor
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-400">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Total</p>
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl shadow-sm text-ptdf-primary dark:text-emerald-400">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Active</p>
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl shadow-sm text-amber-600 dark:text-amber-400">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Pending</p>
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-rose-50 dark:bg-rose-900/30 rounded-xl shadow-sm text-rose-600 dark:text-rose-400">
                        <Ban className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.suspended}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Suspended</p>
                    </div>
                </div>
            </div>

            {/* Filters + View Toggle */}
            <div className="glass-card rounded-2xl p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative group">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-ptdf-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by company name or registration..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-ptdf-primary/20 focus:border-ptdf-primary text-sm transition-all"
                        />
                    </div>

                    {/* Zone Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400 hidden sm:block" />
                        <select
                            value={zoneFilter}
                            onChange={(e) => { setZoneFilter(e.target.value as GeographicZone | 'ALL'); setCurrentPage(1); }}
                            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-ptdf-primary/20 focus:border-ptdf-primary text-sm transition-all cursor-pointer hover:bg-white dark:hover:bg-gray-800"
                        >
                            <option value="ALL">All Zones</option>
                            {Object.entries(ZONE_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value as ContractorStatus | 'ALL'); setCurrentPage(1); }}
                        className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-ptdf-primary/20 focus:border-ptdf-primary text-sm transition-all cursor-pointer hover:bg-white dark:hover:bg-gray-800"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PENDING">Pending</option>
                        <option value="SUSPENDED">Suspended</option>
                    </select>

                    {/* Rating Filter */}
                    <select
                        value={ratingFilter}
                        onChange={(e) => { setRatingFilter(e.target.value as RatingFilter); setCurrentPage(1); }}
                        className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-ptdf-primary/20 focus:border-ptdf-primary text-sm transition-all cursor-pointer hover:bg-white dark:hover:bg-gray-800"
                    >
                        <option value="ALL">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4+">4+ Stars</option>
                        <option value="3+">3+ Stars</option>
                        <option value="BELOW3">Below 3 Stars</option>
                    </select>

                    {/* Clear Filters Button */}
                    {(searchQuery || zoneFilter !== 'ALL' || statusFilter !== 'ALL' || ratingFilter !== 'ALL') && (
                        <button
                            onClick={resetFilters}
                            className="px-3 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-ptdf-primary dark:hover:text-ptdf-primary border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-1"
                        >
                            <X className="h-4 w-4" />
                            Clear
                        </button>
                    )}

                </div>

                {/* View Toggle */}
                <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                    <button
                        onClick={() => { setViewMode('table'); setCurrentPage(1); }}
                        className={`p-2.5 ${viewMode === 'table' ? 'bg-ptdf-primary text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                        title="Table View"
                    >
                        <List className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => { setViewMode('cards'); setCurrentPage(1); }}
                        className={`p-2.5 ${viewMode === 'cards' ? 'bg-ptdf-primary text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                        title="Card View"
                    >
                        <LayoutGrid className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
                <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                            {selectedIds.size} contractor{selectedIds.size > 1 ? 's' : ''} selected
                        </span>
                        <button onClick={clearSelection} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                            Clear selection
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleBulkAction('message')}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <Mail className="h-4 w-4" /> Message
                        </button>
                        <button
                            onClick={() => handleBulkAction('suspend')}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/50"
                        >
                            <Ban className="h-4 w-4" /> Suspend
                        </button>
                        <button
                            onClick={() => handleBulkAction('delete')}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50"
                        >
                            <Trash2 className="h-4 w-4" /> Delete
                        </button>
                    </div>
                </div>
            )}

            {/* Content */}
            {viewMode === 'table' ? (
                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50">
                            <thead className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.size === paginatedContractors.length && paginatedContractors.length > 0}
                                                onChange={toggleSelectAll}
                                                className="rounded border-gray-300 text-ptdf-primary focus:ring-ptdf-primary"
                                            />
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-ptdf-primary transition-colors"
                                        onClick={() => handleSort('companyName')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Company & Reg
                                            {getSortIcon('companyName')}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-ptdf-primary transition-colors"
                                        onClick={() => handleSort('zone')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Zone
                                            {getSortIcon('zone')}
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-ptdf-primary transition-colors"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Status
                                            {getSortIcon('status')}
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-ptdf-primary transition-colors"
                                        onClick={() => handleSort('rating')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Rating
                                            {getSortIcon('rating')}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-gray-200/50 dark:divide-gray-700/50">
                                {paginatedContractors.map((contractor) => (
                                    <tr
                                        key={contractor.id}
                                        onClick={() => handleViewProfile(contractor.id)}
                                        className={`group hover:bg-white dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer ${selectedIds.has(contractor.id) ? 'bg-ptdf-primary/5 dark:bg-ptdf-primary/10' : ''}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(contractor.id)}
                                                onChange={() => toggleSelect(contractor.id)}
                                                className="rounded border-gray-300 text-ptdf-primary focus:ring-ptdf-primary"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-ptdf-primary via-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                    {contractor.companyName.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-ptdf-primary transition-colors">
                                                        {contractor.companyName}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                        {contractor.registrationNumber}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{contractor.email}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{contractor.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">{getZoneBadge(contractor.zone)}</td>
                                        <td className="px-6 py-4">{getStatusBadge(contractor.status)}</td>
                                        <td className="px-6 py-4">
                                            {contractor.totalReviews > 0 ? (
                                                <div
                                                    className="relative"
                                                    onMouseEnter={() => setHoveredRatingId(contractor.id)}
                                                    onMouseLeave={() => setHoveredRatingId(null)}
                                                >
                                                    <div className="flex items-center gap-1 cursor-help">{renderStars(contractor.rating)}</div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{contractor.rating.toFixed(1)} ({contractor.totalReviews})</p>
                                                    {hoveredRatingId === contractor.id && (
                                                        <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-30">
                                                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1"><Info className="h-3 w-3" /> Rating Breakdown</p>
                                                            {(() => {
                                                                const breakdown = getRatingBreakdown(contractor.id);
                                                                return (
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-500 dark:text-gray-400">Quality</span>
                                                                            <span className="font-medium text-gray-900 dark:text-white">{breakdown.quality.toFixed(1)}</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-500 dark:text-gray-400">Timeliness</span>
                                                                            <span className="font-medium text-gray-900 dark:text-white">{breakdown.timeliness.toFixed(1)}</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-gray-500 dark:text-gray-400">Communication</span>
                                                                            <span className="font-medium text-gray-900 dark:text-white">{breakdown.communication.toFixed(1)}</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 dark:text-gray-500">No reviews</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActionMenuOpen(actionMenuOpen === contractor.id ? null : contractor.id)}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                >
                                                    <MoreVertical className="h-5 w-5 text-gray-400" />
                                                </button>
                                                {actionMenuOpen === contractor.id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                                                        <button onClick={() => handleViewProfile(contractor.id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                            <Eye className="h-4 w-4" /> View Profile
                                                        </button>
                                                        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                            <FolderOpen className="h-4 w-4" /> View Projects
                                                        </button>
                                                        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                            <MessageSquare className="h-4 w-4" /> Send Message
                                                        </button>
                                                        <button onClick={() => handleEdit(contractor)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                            <Edit className="h-4 w-4" /> Edit Details
                                                        </button>
                                                        {contractor.status === 'PENDING' && (
                                                            <>
                                                                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                                                                <button onClick={() => { setActionMenuOpen(null); handleApprove(contractor, true); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20">
                                                                    <ThumbsUp className="h-4 w-4" /> Approve
                                                                </button>
                                                                <button onClick={() => { setActionMenuOpen(null); setApprovalContractor(contractor); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                                    <ThumbsDown className="h-4 w-4" /> Reject with Note
                                                                </button>
                                                            </>
                                                        )}
                                                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                                                        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                            <Ban className="h-4 w-4" /> {contractor.status === 'SUSPENDED' ? 'Unsuspend' : 'Suspend'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : null}

            {/* Card View */}
            {viewMode === 'cards' && (
                <div>
                    {paginatedContractors.length === 0 ? (
                        <div className="glass-card rounded-2xl p-12 text-center">
                            <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No contractors found</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paginatedContractors.map((contractor) => (
                                <div
                                    key={contractor.id}
                                    onClick={() => handleViewProfile(contractor.id)}
                                    className="glass-card rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-ptdf-primary/20 to-teal-100/20 dark:from-ptdf-primary/30 dark:to-teal-900/30 flex items-center justify-center text-ptdf-primary font-bold shadow-sm">
                                                    {contractor.logo ? (
                                                        <img src={contractor.logo} alt="" className="h-full w-full rounded-xl object-cover" />
                                                    ) : (
                                                        contractor.companyName.substring(0, 2).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-ptdf-primary transition-colors">{contractor.companyName}</h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{contractor.registrationNumber}</p>
                                                </div>
                                            </div>
                                            {getStatusBadge(contractor.status)}
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-500">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                </div>
                                                {getZoneBadge(contractor.zone)}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-500">
                                                    <Briefcase className="h-3.5 w-3.5" />
                                                </div>
                                                <span><span className="font-semibold">{contractor.projectCount}</span> projects (<span className="text-emerald-600">{contractor.activeProjects} active</span>)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500">
                                                    <Star className="h-3.5 w-3.5 fill-current" />
                                                </div>
                                                <div className="flex items-center gap-1 font-medium text-gray-900 dark:text-white">
                                                    {contractor.rating.toFixed(1)}
                                                    <span className="text-xs text-gray-400 font-normal">({contractor.totalReviews} reviews)</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                                            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatRelativeTime(contractor.lastActiveAt)}
                                            </span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleViewProfile(contractor.id); }}
                                                className="text-xs font-bold text-ptdf-primary hover:text-ptdf-secondary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300"
                                            >
                                                View Profile <ChevronRight className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        setCurrentPage={setCurrentPage}
                        totalItems={filteredAndSortedContractors.length}
                        itemsPerPage={itemsPerPage}
                    />
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <InviteContractorModal onClose={() => setShowInviteModal(false)} onSuccess={() => { setShowInviteModal(false); }} />
            )}

            {/* Edit Modal */}
            {editingContractor && (
                <EditContractorModal
                    contractor={editingContractor}
                    onClose={() => setEditingContractor(null)}
                    onSuccess={(updated) => {
                        setContractors(prev => prev.map(c => c.id === updated.id ? updated : c));
                        setEditingContractor(null);
                    }}
                />
            )}

            {/* Approval/Rejection Modal */}
            {approvalContractor && (
                <ApprovalModal
                    contractor={approvalContractor}
                    onClose={() => setApprovalContractor(null)}
                    onSubmit={(notes) => handleApprove(approvalContractor, false, notes)}
                />
            )}

            {/* Action Menu Backdrop */}
            {actionMenuOpen && (
                <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpen(null)} />
            )}
        </div>
    );
}

// Pagination Component
function Pagination({ currentPage, totalPages, setCurrentPage, totalItems, itemsPerPage }: {
    currentPage: number; totalPages: number; setCurrentPage: (p: number) => void; totalItems: number; itemsPerPage: number
}) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                    Math.max(0, currentPage - 3),
                    Math.min(totalPages, currentPage + 2)
                ).map(page => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${page === currentPage
                            ? 'bg-ptdf-primary text-white'
                            : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
            </div>
        </div>
    );
}

// Invite Contractor Modal Component
function InviteContractorModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<InviteContractorData>({
        companyName: '',
        email: '',
        phone: '',
        zone: 'SOUTH_WEST',
        specializations: [],
        message: '',
    });

    const specializationOptions = [
        'Civil Engineering', 'Building Construction', 'Road Construction',
        'Bridge Construction', 'Renewable Energy', 'Electrical Engineering',
        'Mechanical Engineering', 'Environmental Engineering', 'Marine Engineering',
    ];

    const toggleSpecialization = (spec: string) => {
        setFormData(prev => ({
            ...prev,
            specializations: prev.specializations.includes(spec)
                ? prev.specializations.filter(s => s !== spec)
                : [...prev.specializations, spec]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await inviteContractor(formData);
            onSuccess();
        } catch (error) {
            console.error('Failed to invite contractor', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Invite Contractor</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name *</label>
                        <input type="text" required value={formData.companyName} onChange={e => setFormData(p => ({ ...p, companyName: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
                        <input type="email" required value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                        <input type="tel" required value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Geographic Zone *</label>
                        <select required value={formData.zone} onChange={e => setFormData(p => ({ ...p, zone: e.target.value as GeographicZone }))} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            {Object.entries(ZONE_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specializations *</label>
                        <div className="flex flex-wrap gap-2">
                            {specializationOptions.map(spec => (
                                <button key={spec} type="button" onClick={() => toggleSpecialization(spec)} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${formData.specializations.includes(spec) ? 'bg-ptdf-primary text-white border-ptdf-primary' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-ptdf-primary'}`}>
                                    {spec}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message (Optional)</label>
                        <textarea rows={3} value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} placeholder="Add a personalized message..." className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none" />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                        <button type="submit" disabled={isSubmitting || formData.specializations.length === 0} className="flex-1 px-4 py-2.5 bg-ptdf-primary hover:bg-ptdf-primary/90 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'Sending...' : 'Send Invitation'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Edit Contractor Modal Component
function EditContractorModal({ contractor, onClose, onSuccess }: {
    contractor: AdminContractor;
    onClose: () => void;
    onSuccess: (updated: AdminContractor) => void
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        companyName: contractor.companyName,
        email: contractor.email,
        phone: contractor.phone,
        zone: contractor.zone,
        status: contractor.status,
        specializations: [...contractor.specializations],
    });

    const specializationOptions = [
        'Civil Engineering', 'Building Construction', 'Road Construction',
        'Bridge Construction', 'Renewable Energy', 'Electrical Engineering',
        'Mechanical Engineering', 'Environmental Engineering', 'Marine Engineering',
    ];

    const toggleSpecialization = (spec: string) => {
        setFormData(prev => ({
            ...prev,
            specializations: prev.specializations.includes(spec)
                ? prev.specializations.filter(s => s !== spec)
                : [...prev.specializations, spec]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            const updated: AdminContractor = {
                ...contractor,
                ...formData,
            };
            onSuccess(updated);
        } catch (error) {
            console.error('Failed to update contractor', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Contractor</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.companyName}
                            onChange={e => setFormData(p => ({ ...p, companyName: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zone *</label>
                            <select
                                required
                                value={formData.zone}
                                onChange={e => setFormData(p => ({ ...p, zone: e.target.value as GeographicZone }))}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                {Object.entries(ZONE_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                            <select
                                required
                                value={formData.status}
                                onChange={e => setFormData(p => ({ ...p, status: e.target.value as ContractorStatus }))}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="PENDING">Pending</option>
                                <option value="SUSPENDED">Suspended</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specializations</label>
                        <div className="flex flex-wrap gap-2">
                            {specializationOptions.map(spec => (
                                <button
                                    key={spec}
                                    type="button"
                                    onClick={() => toggleSpecialization(spec)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${formData.specializations.includes(spec) ? 'bg-ptdf-primary text-white border-ptdf-primary' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-ptdf-primary'}`}
                                >
                                    {spec}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-ptdf-primary hover:bg-ptdf-primary/90 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Approval/Rejection Modal Component
function ApprovalModal({ contractor, onClose, onSubmit }: {
    contractor: AdminContractor;
    onClose: () => void;
    onSubmit: (notes: string) => void
}) {
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        onSubmit(notes);
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Reject Contractor</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-sm text-red-700 dark:text-red-400">
                            You are about to reject <strong>{contractor.companyName}</strong>.
                            This will change their status to Suspended.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Rejection Reason *
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Please provide a reason for rejecting this contractor..."
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !notes.trim()}
                            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <ThumbsDown className="h-4 w-4" />
                            {isSubmitting ? 'Rejecting...' : 'Reject Contractor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
