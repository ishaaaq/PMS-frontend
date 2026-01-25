
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/ui/Sidebar';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen mesh-bg">
            <Sidebar />
            <div className="md:pl-64 flex flex-col flex-1">
                {/* Top bar with theme toggle */}
                <div className="sticky top-0 z-40 flex items-center justify-between pl-1 pt-1 sm:pl-3 sm:pt-3 pr-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/30">
                    <button
                        type="button"
                        className="md:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ptdf-primary"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Menu className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <div className="flex-1" />
                    <ThemeToggle variant="dropdown" />
                </div>
                <main className="flex-1">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
