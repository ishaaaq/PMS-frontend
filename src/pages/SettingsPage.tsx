import { useState } from 'react';
import {
    User, Bell, Lock, Shield, Moon, Sun, Globe,
    Smartphone, Mail, Camera, Save, LogOut
} from 'lucide-react';

import { useTheme } from '../contexts/ThemeContext';

export default function SettingsPage() {
    const { resolvedTheme, toggleTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        marketing: false,
        security: true
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences and system settings</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        {[
                            { id: 'profile', label: 'Profile Settings', icon: User },
                            { id: 'notifications', label: 'Notifications', icon: Bell },
                            { id: 'security', label: 'Security & Login', icon: Shield },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === item.id
                                    ? 'bg-ptdf-primary text-white shadow-lg shadow-ptdf-primary/30'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <item.icon className={`mr-3 h-5 w-5 ${activeTab === item.id ? 'text-white' : 'text-gray-400'}`} />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Preferences</h3>
                        <div className="px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                                <span>Dark Mode</span>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isDark ? 'bg-ptdf-primary' : 'bg-gray-200'}`}
                            >
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <div className="glass-card rounded-2xl p-8 min-h-[500px]">

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Personal Information</h3>

                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="relative group">
                                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-ptdf-primary to-emerald-400 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                                                IA
                                            </div>
                                            <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700 text-gray-600 hover:text-ptdf-primary transition-colors">
                                                <Camera className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Ishaq Abdullahi</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Super Administrator</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    defaultValue="Ishaq Abdullahi"
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-ptdf-primary/20 focus:border-ptdf-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="email"
                                                    defaultValue="i.abdullahi@ptdf.gov.ng"
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-ptdf-primary/20 focus:border-ptdf-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                            <div className="relative">
                                                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    defaultValue="+234 803 123 4567"
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-ptdf-primary/20 focus:border-ptdf-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <select className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-ptdf-primary/20 focus:border-ptdf-primary transition-all appearance-none">
                                                    <option>English (UK)</option>
                                                    <option>French</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <button className="flex items-center px-6 py-2.5 bg-ptdf-primary hover:bg-ptdf-secondary text-white rounded-xl shadow-lg shadow-ptdf-primary/30 transition-all active:scale-95 font-medium">
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Notification Preferences</h3>

                                    <div className="space-y-6">
                                        {[
                                            { id: 'email', label: 'Email Notifications', desc: 'Receive daily summaries and critical alerts via email.' },
                                            { id: 'push', label: 'Push Notifications', desc: 'Get real-time updates on your desktop and mobile devices.' },
                                            { id: 'security', label: 'Security Alerts', desc: 'Get notified about new sign-ins and suspicious activity.' },
                                            { id: 'marketing', label: 'Product Updates', desc: 'Receive news about new features and improvements.' },
                                        ].map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{item.label}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                                                </div>
                                                <button
                                                    onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof notifications] }))}
                                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${notifications[item.id as keyof typeof notifications] ? 'bg-ptdf-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                                                >
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifications[item.id as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Security & Authentication</h3>

                                    <div className="space-y-6">
                                        <div className="p-6 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
                                                    <Lock className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4">Ensure your account is secure by using a strong password.</p>
                                                    <button className="text-sm font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300">
                                                        Update Password &rarr;
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                                                    <Shield className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4">Add an extra layer of security to your account.</p>
                                                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                                                        Enable 2FA
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Active Sessions</h4>
                                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <Smartphone className="h-5 w-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Chrome on Windows</p>
                                                        <p className="text-xs text-green-600 font-medium">Active now • Abuja, Nigeria</p>
                                                    </div>
                                                </div>
                                                <button className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <LogOut className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
