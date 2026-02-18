import { Home, Users, Bell, Settings, PieChart, Flag, DollarSign, Search, ShieldCheck, LogOut, Briefcase, X, FileText, MessageSquare, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface NavItemType {
    name: string;
    href: string;
    icon: LucideIcon;
    roles?: string[];
}

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps = {}) {
    const location = useLocation();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const { user, logout } = useAuth();
    const currentRole = user?.role || 'CONTRACTOR';

    const essentials = [
        { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['ADMIN'] },
        { name: 'Dashboard', href: '/dashboard/consultant', icon: Home, roles: ['CONSULTANT'] },
        { name: 'Overview', href: '/dashboard/contractor', icon: Home, roles: ['CONTRACTOR'] },
        { name: 'Projects', href: '/dashboard/projects', icon: Briefcase, roles: ['ADMIN'] },
        { name: 'Consultants', href: '/dashboard/consultants', icon: ShieldCheck, roles: ['ADMIN'] },
        { name: 'Contractors', href: '/dashboard/contractors', icon: Users, roles: ['ADMIN'] },
        { name: 'My Projects', href: '/dashboard/consultant/projects', icon: Briefcase, roles: ['CONSULTANT'] },
        { name: 'My Contractors', href: '/dashboard/consultant/contractors', icon: Users, roles: ['CONSULTANT'] },
        { name: 'Verifications', href: '/dashboard/consultant/verification-queue', icon: ShieldCheck, roles: ['CONSULTANT'] },
        { name: 'Assignments', href: '/dashboard/contractor/assignments', icon: Briefcase, roles: ['CONTRACTOR'] },
        { name: 'Documents', href: '/dashboard/contractor/documents', icon: FileText, roles: ['CONTRACTOR'] },
        { name: 'Messages', href: '/dashboard/contractor/messages', icon: MessageSquare, roles: ['CONTRACTOR'] },
        { name: 'Profile', href: '/dashboard/contractor/profile', icon: User, roles: ['CONTRACTOR'] },
        { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, roles: ['ADMIN', 'CONSULTANT'] },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['ADMIN', 'CONSULTANT'] },
    ];

    const projectMenu = [
        { name: 'Analytics & Reports', href: '/dashboard/reports', icon: PieChart, roles: ['ADMIN'] },
        { name: 'Milestones', href: '/dashboard/milestones', icon: Flag, roles: ['ADMIN'] },
        { name: 'Users', href: '/dashboard/users', icon: Users, roles: ['ADMIN'] },
        { name: 'Budget', href: '/dashboard/budget', icon: DollarSign, roles: ['ADMIN'] },
    ];

    const filteredEssentials = essentials.filter(item => item.roles?.includes(currentRole));
    const filteredProjectMenu = projectMenu.filter(item => item.roles?.includes(currentRole));

    // Prevent body scroll when mobile drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Focus trap: keep focus within drawer when open
    useEffect(() => {
        if (!isOpen || !sidebarRef.current) return;

        const sidebar = sidebarRef.current;
        const focusableElements = sidebar.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        sidebar.addEventListener('keydown', handleTab);
        firstElement?.focus();

        return () => {
            sidebar.removeEventListener('keydown', handleTab);
        };
    }, [isOpen]);

    const NavItem = ({ item }: { item: NavItemType }) => {
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
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar - Desktop: always visible, Mobile: drawer */}
            <div
                ref={sidebarRef}
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-gray-200/50 dark:border-gray-700/30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl transition-transform duration-300 ease-in-out",
                    // Desktop: always visible
                    "md:flex md:translate-x-0",
                    // Mobile: drawer behavior
                    isOpen ? "flex translate-x-0" : "hidden -translate-x-full md:flex md:translate-x-0"
                )}
            >
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-ptdf-primary to-emerald-400">
                            PTDF PMS
                        </span>
                        {/* Close button - only visible on mobile */}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="ml-auto p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden"
                                aria-label="Close sidebar"
                            >
                                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        )}
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

                    <div className="flex-1 flex flex-col overflow-y-auto pt-2 pb-4">
                        <div className="px-4 mb-2">
                            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Essentials</p>
                        </div>
                        <nav className="flex-1 space-y-1 mb-6">
                            {filteredEssentials.map((item) => (
                                <NavItem key={item.name} item={item} />
                            ))}
                        </nav>


                        {filteredProjectMenu.length > 0 && (
                            <>
                                <div className="px-4 mb-2">
                                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">This project</p>
                                </div>
                                <nav className="flex-1 space-y-1 mb-6">
                                    {filteredProjectMenu.map((item) => (
                                        <NavItem key={item.name} item={item} />
                                    ))}
                                </nav>
                            </>
                        )}
                    </div>

                    <div className="flex-shrink-0 flex border-t border-gray-200/50 dark:border-gray-700/30 p-4">
                        <div className="flex w-full items-center justify-between">
                            <Link to="/dashboard/settings" className="flex-1 group block p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors mr-2">
                                <div className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-ptdf-primary to-emerald-400 flex items-center justify-center text-sm font-bold text-white shadow-glow-sm">
                                        {user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">{user?.full_name || 'User'}</p>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{user?.role || 'Unknown'}</p>
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
        </>
    );
}
