
import { useState } from 'react';
import { Users, UserPlus, Shield, MoreVertical, Search, Filter, ShieldCheck, ShieldAlert } from 'lucide-react';
import InviteModal from '../components/dashboard/InviteModal';

export default function UsersPage() {
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const users = [
        { id: '1', name: 'Ishaq Abdullahi', email: 'i.abdullahi@ptdf.gov.ng', role: 'ADMIN', status: 'Active', zone: 'FCT' },
        { id: '2', name: 'Amina Bello', email: 'a.bello@consulting.com', role: 'CONSULTANT', status: 'Active', zone: 'Kaduna' },
        { id: '3', name: 'John Contractor', email: 'j.smith@buildright.com', role: 'CONTRACTOR', status: 'Active', zone: 'Lagos' },
        { id: '4', name: 'Fatus Yusuf', email: 'f.yusuf@ptdf.gov.ng', role: 'STAFF', status: 'Inactive', zone: 'Abuja' },
    ];

    return (
        <div className="space-y-8">
            <div className="md:flex md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">User Management</h2>
                    <p className="mt-1 text-sm text-gray-500 text-nowrap">Invite and manage consultants, contractors, and staff.</p>
                </div>
                <div className="mt-4 flex gap-3 md:mt-0">
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        <UserPlus className="mr-2 h-4 w-4" /> Invite New User
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', value: '1,204', icon: Users, color: 'text-gray-600' },
                    { label: 'Consultants', value: '84', icon: Shield, color: 'text-blue-600' },
                    { label: 'Contractors', value: '256', icon: ShieldCheck, color: 'text-green-600' },
                    { label: 'Platform Health', value: '99.9%', icon: ShieldAlert, color: 'text-indigo-600' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            </div>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-4 items-center justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="text" placeholder="Search by name, email or zone..." className="w-full pl-9 pr-4 py-2 text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 border" />
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3 py-2 text-xs font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center uppercase">
                            <Filter className="h-3 w-3 mr-2" /> Filter Roles
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/20">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest text-nowrap">Name & Email</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest text-nowrap">Role</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest text-nowrap">Zone</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest text-nowrap">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest text-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase">
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                                <div className="text-xs text-gray-500 font-medium">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                            user.role === 'CONSULTANT' ? 'bg-blue-100 text-blue-700' :
                                                user.role === 'CONTRACTOR' ? 'bg-green-100 text-green-700' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-500 uppercase">{user.zone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                            <span className="text-xs font-bold text-gray-700 uppercase">{user.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button className="p-1 text-gray-400 hover:text-gray-900 transition-colors">
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
