import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    Mail, Phone, MapPin, Calendar, Shield, Activity,
    CheckCircle, Key, Smartphone, Globe, LogIn,
    FileText, UserPlus, Download, ArrowLeft, Edit
} from 'lucide-react';

interface ActivityLog {
    id: string;
    action: string;
    text: string;
    icon: string;
    time: string;
}

export default function UserDetailPage() {
    const { id } = useParams();
    const [user, setUser] = useState<any>(null);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            setLoading(true);
            try {
                // Fetch Profile
                const { data: profile, error: profileErr } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', id)
                    .single();

                if (profileErr) throw profileErr;
                setUser(profile);

                // Fetch logs
                const { data: logs, error: logsErr } = await supabase
                    .from('audit_logs')
                    .select('*')
                    .eq('actor_user_id', id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (!logsErr && logs) {
                    setActivities(logs.map(l => ({
                        id: l.id,
                        action: l.action.replace(/_/g, ' '),
                        text: l.details || `Performed ${l.action}`,
                        icon: l.action.includes('LOGIN') ? 'LogIn' : l.action.includes('REPORT') ? 'FileText' : 'Activity',
                        time: new Date(l.created_at).toLocaleString()
                    })));
                }

            } catch (err) {
                console.error("User Detail Error: ", err);
            } finally {
                setLoading(false);
            }
        }
        if (id) loadUser();
    }, [id]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Profile...</div>;
    }

    if (!user) {
        return <div className="p-8 text-center text-gray-500">User not found in system</div>;
    }

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'LogIn': return LogIn;
            case 'CheckCircle': return CheckCircle;
            case 'Download': return Download;
            case 'UserPlus': return UserPlus;
            case 'FileText': return FileText;
            default: return Activity;
        }
    };

    const initials = user.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard/users" className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 text-gray-500 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Profile</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Link to="/dashboard/users" className="hover:text-ptdf-primary transition-colors">User Management</Link>
                            <span>/</span>
                            <span>{user.full_name}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Key className="h-4 w-4" /> Reset Password
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-ptdf-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-ptdf-primary/30 hover:bg-ptdf-secondary transition-colors">
                        <Edit className="h-4 w-4" /> Edit Profile
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Profile Card */}
                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-2xl border border-white/50 dark:border-gray-700/50 relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-900/20 dark:to-purple-900/20" />

                        <div className="relative flex flex-col items-center text-center mt-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-2xl font-bold text-gray-500 dark:text-gray-300 border-4 border-white dark:border-gray-800 shadow-xl mb-4">
                                {initials}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user.full_name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{user.role}</p>

                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${user.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-gray-500'}`} />
                                {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-900 dark:text-white font-medium break-all">{user.user_id + '@ptdf.gov.ng'} {/* mock email if not in profile */}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-300">{user.phone || 'No phone recorded'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Shield className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-300">{user.role} Department</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-300">Nigeria</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-300">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Security Card */}
                    <div className="glass-card p-6 rounded-2xl border border-white/50 dark:border-gray-700/50">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-ptdf-primary" /> Security & Access
                        </h4>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                        <Smartphone className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Auth Method</p>
                                        <p className="text-[10px] text-gray-500">Supabase Auth</p>
                                    </div>
                                </div>
                                <div className={`h-2 w-2 rounded-full bg-green-500`} />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                        <Globe className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Status</p>
                                        <p className="text-[10px] text-gray-500">System user</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Activity & Permissions */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Permissions Section */}
                    <div className="glass-card p-6 rounded-2xl border border-white/50 dark:border-gray-700/50">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                <Key className="h-4 w-4 text-ptdf-primary" /> Role Permissions
                            </h4>
                            <span className="text-xs font-medium text-gray-500">Capabilities Based on {user.role}</span>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {user.role === 'ADMIN' && (
                                <>
                                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">View All Projects</span>
                                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">Approve Budgets</span>
                                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">Manage Users</span>
                                </>
                            )}
                            {user.role === 'CONSULTANT' && (
                                <>
                                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">View Assigned Projects</span>
                                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">Submit Reports</span>
                                </>
                            )}
                            {user.role === 'CONTRACTOR' && (
                                <>
                                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">View Own Projects</span>
                                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">Update Milestones</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Activity Log */}
                    <div className="glass-card rounded-2xl border border-white/50 dark:border-gray-700/50 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                <Activity className="h-4 w-4 text-ptdf-primary" /> Recent Activity
                            </h4>
                            <button className="text-xs font-bold text-ptdf-primary hover:text-ptdf-secondary transition-colors">
                                View Full Log
                            </button>
                        </div>

                        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                            {activities.length > 0 ? activities.map((log: ActivityLog) => {
                                const Icon = getIcon(log.icon);
                                return (
                                    <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 mt-1">
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{log.action}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{log.text}</p>
                                        </div>
                                        <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">{log.time}</span>
                                    </div>
                                );
                            }) : (
                                <div className="p-8 text-center text-sm text-gray-500">No recent activities found for this user.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
