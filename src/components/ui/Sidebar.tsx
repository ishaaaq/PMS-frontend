
import { Home, Users, Bell, Settings, PieChart, FileText, MapPin, Flag, DollarSign, ChevronDown, Plus, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

export default function Sidebar() {
    const location = useLocation();

    const essentials = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Contractor', href: '/dashboard/contractors', icon: Users },
        { name: 'Notification', href: '/dashboard/notifications', icon: Bell },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    const projectMenu = [
        { name: 'Analytics', href: '/dashboard/analytics', icon: PieChart },
        { name: 'Report', href: '/dashboard/reports', icon: FileText },
        { name: 'Milestones', href: '/dashboard/milestones', icon: Flag },
        { name: 'Users', href: '/dashboard/users', icon: Users },
        { name: 'Budget', href: '/dashboard/budget', icon: DollarSign },
    ];

    const NavItem = ({ item }: { item: any }) => {
        const isActive = location.pathname === item.href;
        return (
            <Link
                to={item.href}
                className={cn(
                    isActive
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md mx-2'
                )}
            >
                <item.icon className={cn(
                    isActive ? 'text-purple-700' : 'text-gray-400 group-hover:text-gray-500',
                    "mr-3 flex-shrink-0 h-5 w-5"
                )} aria-hidden="true" />
                {item.name}
            </Link>
        );
    };

    return (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-100">
                    <span className="text-xl font-bold text-gray-900">PTDF</span>
                </div>

                {/* Search Placeholder */}
                <div className="px-4 mt-4 mb-2">
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input type="text" className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md bg-gray-50 py-2" placeholder="Search anything" />
                    </div>
                </div>

                <div className="flex-1 flex flex-col overflow-y-auto pt-2 pb-4">
                    <div className="px-4 mb-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Essentials</p>
                    </div>
                    <nav className="flex-1 space-y-1 mb-6">
                        {essentials.map((item) => (
                            <NavItem key={item.name} item={item} />
                        ))}
                    </nav>

                    <div className="px-4 mb-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">This project</p>
                    </div>
                    <nav className="flex-1 space-y-1 mb-6">
                        {projectMenu.map((item) => (
                            <NavItem key={item.name} item={item} />
                        ))}
                    </nav>

                    <div className="px-4 mb-2 flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">All Projects</p>
                        <Plus className="h-4 w-4 text-gray-400 cursor-pointer" />
                    </div>
                    {/* Placeholder for project list */}
                    <div className="px-4 space-y-2">
                        <div className="flex items-center justify-between text-sm text-gray-600 py-1">
                            <span className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-gray-400" /> PMS development</span>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600 py-1">
                            <span className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-gray-400" /> Office construction</span>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                    <Link to="/auth/login" className="flex-shrink-0 w-full group block">
                        <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-white">IA</div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Ishaq Abdullahi</p>
                                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">Super admin</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
