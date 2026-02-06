import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Shield, MoreVertical, Search, Filter, ShieldCheck, ShieldAlert, Mail, MapPin } from 'lucide-react';
import InviteModal from '../components/dashboard/InviteModal';

export default function UsersPage() {
    const navigate = useNavigate();
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    const users = [
        { id: '1', name: 'Ishaq Abdullahi', email: 'i.abdullahi@ptdf.gov.ng', role: 'ADMIN', status: 'Active', zone: 'FCT' },
        { id: '2', name: 'Amina Bello', email: 'a.bello@consulting.com', role: 'CONSULTANT', status: 'Active', zone: 'Kaduna' },
        { id: '3', name: 'John Contractor', email: 'j.smith@buildright.com', role: 'CONTRACTOR', status: 'Active', zone: 'Lagos' },
        { id: '4', name: 'Fatus Yusuf', email: 'f.yusuf@ptdf.gov.ng', role: 'STAFF', status: 'Inactive', zone: 'Abuja' },
        { id: '5', name: 'Chioma Okeke', email: 'c.okeke@ptdf.gov.ng', role: 'ADMIN', status: 'Active', zone: 'Enugu' },
        { id: '6', name: 'Emmanuel Sani', email: 'e.sani@projects.com', role: 'CONSULTANT', status: 'Pending', zone: 'Kano' },
    ];

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            case 'CONSULTANT': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'CONTRACTOR': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h2>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Invite, manage, and monitor system users across all roles</p>
                </div>
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-lg shadow-ptdf-primary/30 text-sm font-bold text-white bg-ptdf-primary hover:bg-ptdf-secondary transition-all active:scale-95"
                >
                    <UserPlus className="mr-2 h-4 w-4" /> Invite New User
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: '1,204', icon: Users, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' },
                    { label: 'Consultants', value: '84', icon: Shield, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'Contractors', value: '256', icon: ShieldCheck, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
                    { label: 'Platform Health', value: '99.9%', icon: ShieldAlert, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">

                {/* Search and Filters */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-ptdf-primary/20 focus:border-ptdf-primary transition-all"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="pl-9 pr-8 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer appearance-none focus:ring-2 focus:ring-ptdf-primary/20 outline-none"
                            >
                                <option value="ALL">All Roles</option>
                                <option value="ADMIN">Admins</option>
                                <option value="CONSULTANT">Consultants</option>
                                <option value="CONTRACTOR">Contractors</option>
                                <option value="STAFF">Staff</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50/50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest text-nowrap">User Details</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest text-nowrap">Role</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest text-nowrap">Location</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest text-nowrap">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest text-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            ) : filteredUsers.map(user => (
                                <tr
                                    key={user.id}
                                    onClick={() => navigate(`/dashboard/users/${user.id}`)}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-xs shadow-sm border border-gray-200 dark:border-gray-600 uppercase">
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    <Mail className="h-3 w-3" /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide gap-1.5 ${getRoleBadgeColor(user.role)}`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 font-medium bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md w-fit">
                                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                            {user.zone} Project Zone
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold ${user.status === 'Active' ? 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/20' :
                                            user.status === 'Pending' ? 'text-yellow-700 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20' :
                                                'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' :
                                                user.status === 'Pending' ? 'bg-yellow-500' :
                                                    'bg-gray-400'
                                                }`}></span>
                                            {user.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="p-2 text-gray-400 hover:text-ptdf-primary hover:bg-ptdf-primary/5 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <InviteModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
        </div>
    );
}
