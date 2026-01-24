import { useEffect, useState } from 'react';
import { getContractorAssignments, getContractorBudget, getContractorNotifications, getMonthlyEarnings } from '../../services/contractor';
import type { Assignment, BudgetSummary, Notification } from '../../services/contractor';
import {
    Wallet, ClipboardList, AlertTriangle, CheckCircle, Clock,
    ArrowUpRight, ArrowDownRight, TrendingUp, Bell, ChevronRight,
    MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ContractorDashboard() {
    const navigate = useNavigate();
    const [budget, setBudget] = useState<BudgetSummary | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [earnings, setEarnings] = useState<{ month: string; amount: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [budgetData, assignmentsData, notificationsData, earningsData] = await Promise.all([
                    getContractorBudget(),
                    getContractorAssignments(),
                    getContractorNotifications(),
                    getMonthlyEarnings()
                ]);
                setBudget(budgetData);
                setAssignments(assignmentsData);
                setNotifications(notificationsData);
                setEarnings(earningsData);
            } catch (error) {
                console.error('Failed to load dashboard data', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatMoney = (amount: number) => {
        if (amount >= 1000000) {
            return `₦${(amount / 1000000).toFixed(1)}M`;
        }
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
    };

    // Derived stats
    const activeMilestones = assignments.flatMap(a => a.milestones).filter(m => m.status === 'IN_PROGRESS' || m.status === 'QUERIED').length;
    const pendingApprovals = assignments.flatMap(a => a.milestones).filter(m => m.status === 'PENDING_APPROVAL').length;
    const completedMilestones = assignments.flatMap(a => a.milestones).filter(m => m.status === 'COMPLETED').length;
    const totalMilestones = assignments.flatMap(a => a.milestones).length;
    const completionRate = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    const unreadNotifications = notifications.filter(n => !n.isRead).length;

    // Get the most urgent action (queried milestone)
    const urgentAction = assignments.find(a => a.status === 'QUERIED');
    const queriedMilestone = urgentAction?.milestones.find(m => m.status === 'QUERIED');

    const stats = [
        { name: 'Active Milestones', stat: activeMilestones, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-100', change: '+2', changeType: 'increase' },
        { name: 'Pending Approvals', stat: pendingApprovals, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', change: pendingApprovals > 0 ? 'Awaiting' : 'None', changeType: 'neutral' },
        { name: 'Payments Received', stat: formatMoney(budget?.amountDisbursed || 0), icon: Wallet, color: 'text-green-600', bg: 'bg-green-100', change: '+₦30M', changeType: 'increase' },
        { name: 'Completion Rate', stat: `${completionRate}%`, icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-100', change: '+8%', changeType: 'increase' },
    ];

    const maxEarning = Math.max(...earnings.map(e => e.amount), 1);

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-72 bg-gray-200 rounded-xl"></div>
                    <div className="h-72 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <header className="md:flex md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">Welcome back, BuildRight Construction Ltd.</p>
                </div>
                <div className="mt-4 flex gap-3 md:mt-0">
                    <button
                        onClick={() => navigate('/contractor/messages')}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                        {unreadNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                                {unreadNotifications}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Urgent Action Alert */}
            {urgentAction && queriedMilestone && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center">
                        <AlertTriangle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-red-800">Action Required: Consultant Query</p>
                            <p className="text-xs text-red-700 mt-0.5">
                                <span className="font-medium">{queriedMilestone.title}</span> on {urgentAction.projectTitle} needs your attention.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/contractor/projects')}
                        className="flex-shrink-0 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                        Fix Now
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((item) => (
                    <div key={item.name} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{item.name}</p>
                                <p className="mt-1.5 text-2xl font-bold text-gray-900">{item.stat}</p>
                            </div>
                            <div className={`p-2.5 rounded-lg ${item.bg}`}>
                                <item.icon className={`h-5 w-5 ${item.color}`} />
                            </div>
                        </div>
                        {item.changeType !== 'neutral' && (
                            <div className="mt-3 flex items-center">
                                {item.changeType === 'increase' ? (
                                    <ArrowUpRight className="h-3.5 w-3.5 text-green-500 mr-1" />
                                ) : (
                                    <ArrowDownRight className="h-3.5 w-3.5 text-red-500 mr-1" />
                                )}
                                <span className={`text-xs font-medium ${item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                                    {item.change}
                                </span>
                                <span className="ml-1.5 text-xs text-gray-400">vs last month</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Earnings Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                            Payment History
                        </h3>
                        <span className="text-xs text-gray-500 font-medium">Last 6 months</span>
                    </div>
                    {/* Chart Container */}
                    <div className="relative h-52 border-b border-l border-gray-200">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-[10px] text-gray-400 -ml-1 py-1">
                            <span>{formatMoney(maxEarning)}</span>
                            <span>{formatMoney(maxEarning / 2)}</span>
                            <span>₦0</span>
                        </div>
                        {/* Bars */}
                        <div className="absolute left-12 right-0 top-0 bottom-0 flex items-end justify-around gap-2 px-2 pb-1">
                            {earnings.map((e, i) => {
                                const heightPercent = maxEarning > 0 ? (e.amount / maxEarning) * 100 : 0;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                            {formatMoney(e.amount)}
                                        </div>
                                        {/* Bar */}
                                        <div
                                            className="w-full max-w-[48px] bg-gradient-to-t from-green-600 to-green-400 rounded-t-md transition-all duration-700 ease-out group-hover:from-green-500 group-hover:to-green-300 shadow-sm"
                                            style={{
                                                height: `${Math.max(heightPercent, 2)}%`,
                                                animation: `growUp 0.8s ease-out ${i * 0.1}s both`
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* X-axis labels */}
                    <div className="flex justify-around mt-2 pl-12 pr-2 text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                        {earnings.map(e => <span key={e.month} className="flex-1 text-center">{e.month}</span>)}
                    </div>
                    {/* CSS Animation */}
                    <style>{`
                        @keyframes growUp {
                            from { transform: scaleY(0); transform-origin: bottom; }
                            to { transform: scaleY(1); transform-origin: bottom; }
                        }
                    `}</style>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                        <button onClick={() => navigate('/contractor/messages')} className="text-xs text-indigo-600 font-medium hover:underline">View All</button>
                    </div>
                    <div className="space-y-3">
                        {notifications.slice(0, 4).map(n => (
                            <div
                                key={n.id}
                                className={`p-3 rounded-lg border-l-4 bg-gray-50 transition-transform hover:scale-[1.01] cursor-pointer ${n.type === 'QUERY' ? 'border-red-400' : n.type === 'PAYMENT' ? 'border-green-400' : n.type === 'APPROVAL' ? 'border-blue-400' : 'border-gray-300'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <h4 className={`font-semibold text-sm ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</h4>
                                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1"></span>}
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Active Projects Overview */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">My Projects</h3>
                    <button onClick={() => navigate('/contractor/projects')} className="text-sm text-indigo-600 font-medium hover:underline flex items-center">
                        View All <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assignments.slice(0, 3).map(a => (
                        <div
                            key={a.id}
                            onClick={() => navigate('/contractor/projects')}
                            className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${a.status === 'QUERIED' ? 'border-red-200 bg-red-50/50' :
                                a.status === 'COMPLETED' ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-white'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{a.projectTitle}</h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${a.status === 'QUERIED' ? 'bg-red-100 text-red-700' :
                                    a.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                        a.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-blue-100 text-blue-700'
                                    }`}>
                                    {a.status.replace('_', ' ')}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 flex items-center mb-3">
                                <MapPin className="h-3 w-3 mr-1" /> {a.location}
                            </p>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Progress</span>
                                    <span className="font-bold text-gray-700">{a.overallProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${a.status === 'QUERIED' ? 'bg-red-500' :
                                            a.status === 'COMPLETED' ? 'bg-green-500' : 'bg-indigo-500'
                                            }`}
                                        style={{ width: `${a.overallProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">{a.milestones.length} milestones</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
