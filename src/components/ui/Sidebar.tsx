import { Home, Users, Bell, Settings, PieChart, Flag, DollarSign, Search, ShieldCheck, LogOut, Briefcase, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../services/mockRole';

export default function Sidebar() {
    const location = useLocation();
    const { user, login, logout } = useAuth();
    const currentRole = user?.role || 'CONTRACTOR';

    const handleRoleSwitch = (role: UserRole) => {
        login(user?.email || 'test@ptdf.gov.ng', role);
    };

    const essentials = [
        { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['ADMIN', 'CONTRACTOR'] },
        { name: 'Dashboard', href: '/dashboard/consultant', icon: Home, roles: ['CONSULTANT'] },
        { name: 'Projects', href: '/dashboard/projects', icon: Briefcase, roles: ['ADMIN'] },
        { name: 'Consultants', href: '/dashboard/consultants', icon: ShieldCheck, roles: ['ADMIN'] },
        { name: 'Contractors', href: '/dashboard/contractors', icon: Users, roles: ['ADMIN'] },
        { name: 'My Projects', href: '/dashboard/consultant/projects', icon: Briefcase, roles: ['CONSULTANT'] },
        { name: 'My Contractors', href: '/dashboard/consultant/contractors', icon: Users, roles: ['CONSULTANT'] },
        { name: 'Verifications', href: '/dashboard/consultant/verification-queue', icon: ShieldCheck, roles: ['CONSULTANT'] },
        { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, roles: ['ADMIN', 'CONSULTANT', 'CONTRACTOR'] },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['ADMIN', 'CONSULTANT', 'CONTRACTOR'] },
    ];

    const projectMenu = [
        { name: 'Analytics & Reports', href: '/dashboard/reports', icon: PieChart, roles: ['ADMIN'] },
        { name: 'Milestones', href: '/dashboard/milestones', icon: Flag, roles: ['ADMIN'] },
        { name: 'Users', href: '/dashboard/users', icon: Users, roles: ['ADMIN'] },
        { name: 'Budget', href: '/dashboard/budget', icon: DollarSign, roles: ['ADMIN'] },
    ];

    const filteredEssentials = essentials.filter(item => item.roles?.includes(currentRole));
    const filteredProjectMenu = projectMenu.filter(item => item.roles?.includes(currentRole));

    const NavItem = ({ item }: { item: any }) => {
        const isActive = location.pathname === item.href;
        return (
            <Link
                to={item.href}
                className={cn(
                    isActive
                        ? 'bg-ptdf-primary/10 text-ptdf-primary dark:text-emerald-400 border-r-2 border-ptdf-primary'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white',
                    'group flex items-center px-3 py-2.5 text-sm font-medium transition-all duration-200 mx-2 rounded-l-lg rounded-r-none'
                )}
            >
                <item.icon className={cn(
                    isActive ? 'text-ptdf-primary dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300',
                    "mr-3 flex-shrink-0 h-5 w-5 transition-colors"
                )} aria-hidden="true" />
                <span className={isActive ? 'font-semibold' : ''}>{item.name}</span>
            </Link>
        );
    };

    return (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-gray-200/50 dark:border-gray-700/30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-50">
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-ptdf-primary to-emerald-400">
                        PTDF PMS
                    </span>
                </div>

                {/* Search Placeholder */}
                <div className="px-4 mt-6 mb-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-ptdf-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 sm:text-sm border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 py-2.5 focus:ring-2 focus:ring-ptdf-primary/20 focus:border-ptdf-primary transition-all"
                            placeholder="Search projects..."
                        />
                    </div>
                </div>

                {/* MOCK ROLE SWITCHER */}
                {/* <div className="px-4 mt-2 mb-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-100 dark:border-blue-800">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2 uppercase">Viewing As:</p>
                        <div className="flex flex-col space-y-1">
                            {(['ADMIN', 'CONSULTANT', 'CONTRACTOR'] as UserRole[]).map((role) => (
                                <button
                                    key={role}
                                    onClick={() => handleRoleSwitch(role)}
                                    className={cn(
                                        "text-xs px-2 py-1 rounded-md text-left flex items-center",
                                        currentRole === role ? "bg-blue-600 text-white" : "hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-300"
                                    )}
                                >
                                    <Shield className="h-3 w-3 mr-2" />
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>
                </div> */}

                <div className="flex-1 flex flex-col overflow-y-auto pt-2 pb-4">
                    <div className="px-4 mb-2">
                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Essentials</p>
                    </div>
                    <nav className="flex-1 space-y-1 mb-6">
                        {filteredEssentials.map((item) => (
                            <NavItem key={item.name} item={item} />
                        ))}
                    </nav>

                    <div className="px-4 mb-2">
                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">This project</p>
                    </div>
                    <nav className="flex-1 space-y-1 mb-6">
                        {filteredProjectMenu.map((item) => (
                            <NavItem key={item.name} item={item} />
                        ))}
                    </nav>


                </div>

                <div className="flex-shrink-0 flex border-t border-gray-200/50 dark:border-gray-700/30 p-4">
                    <div className="flex w-full items-center justify-between">
                        <Link to="/auth/login" className="flex-1 group block p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors mr-2">
                            <div className="flex items-center">
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-ptdf-primary to-emerald-400 flex items-center justify-center text-sm font-bold text-white shadow-glow-sm">IA</div>
                                <div className="ml-3">
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">Ishaq Abdullahi</p>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Super admin</p>
                                </div>
                            </div>
                        </Link>
                        {/* Logout Button */}
                        <button
                            onClick={logout}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
