import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Briefcase, MessageSquare, User, FileText, Bell } from 'lucide-react';
import ThemeToggle from '../components/ui/ThemeToggle';

const navigation = [
    { name: 'Overview', href: '/contractor/dashboard', icon: Home },
    { name: 'Assignments', href: '/contractor/projects', icon: Briefcase },
    { name: 'Documents', href: '/contractor/documents', icon: FileText },
    { name: 'Messages', href: '/contractor/messages', icon: MessageSquare },
    { name: 'Profile', href: '/contractor/profile', icon: User },
];

export default function ContractorLayout() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Mobile Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 md:hidden">
                <div className="flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <img className="h-8 w-auto" src="/logo.png" alt="PTDF" onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x400?text=PTDF')} />
                        <span className="font-bold text-gray-900 dark:text-white">PTDF Contractor</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <button className="relative p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                            <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white dark:ring-gray-800" />
                            <Bell className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Desktop Sidebar */}
                <aside className={`hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30`}>
                    <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <img className="h-8 w-auto mr-2" src="/logo.png" alt="PTDF" onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x400?text=PTDF')} />
                            <span className="font-bold text-gray-900 dark:text-white">PTDF Contractor</span>
                        </div>
                    </div>
                    <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                        <nav className="mt-5 flex-1 space-y-1 px-4">
                            {navigation.map((item) => {
                                const isActive = location.pathname.startsWith(item.href);
                                return (
                                    <NavLink
                                        key={item.name}
                                        to={item.href}
                                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                            ? 'bg-ptdf-primary/10 text-ptdf-primary dark:bg-ptdf-primary/20'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                    >
                                        <item.icon
                                            className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-ptdf-primary' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                                                }`}
                                        />
                                        {item.name}
                                    </NavLink>
                                );
                            })}
                        </nav>
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <ThemeToggle variant="dropdown" />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                    <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">JD</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">John Doe</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">BuildRight Ltd</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 md:pl-64 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden z-30 pb-safe">
                <div className="grid grid-cols-5 h-16">
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={`flex flex-col items-center justify-center space-y-1 ${isActive ? 'text-ptdf-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <item.icon className="h-6 w-6" />
                                <span className="text-xs font-medium">{item.name}</span>
                            </NavLink>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
