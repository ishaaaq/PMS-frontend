import { Folder, AlertTriangle, CheckCircle, Clock, MapPin, TrendingUp, Filter, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DashboardService, type DashboardStats, type TopContractor, type ZoneCluster, type RiskAlert, type PerformanceSnapshot } from '../services/dashboard.service';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function DashboardHome() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [topContractors, setTopContractors] = useState<TopContractor[]>([]);
    const [zoneData, setZoneData] = useState<ZoneCluster[]>([]);
    const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
    const [chartData, setChartData] = useState<{ planned: number[]; actual: number[] }>({ planned: [], actual: [] });

    useEffect(() => {
        async function loadDashboard() {
            try {
                const [statsData, contractors, clusters, alerts, snapshots] = await Promise.all([
                    DashboardService.getStats(),
                    DashboardService.getTopContractors(),
                    DashboardService.getZoneClusters(),
                    DashboardService.getRiskAlerts(),
                    DashboardService.getPerformanceSnapshots(),
                ]);
                setStats(statsData);
                setTopContractors(contractors);
                setZoneData(clusters);
                setRiskAlerts(alerts);

                // Map performance snapshots to chart arrays (12 months)
                if (snapshots.length > 0) {
                    const planned = Array(12).fill(0);
                    const actual = Array(12).fill(0);
                    snapshots.forEach((s: PerformanceSnapshot) => {
                        if (s.month >= 1 && s.month <= 12) {
                            planned[s.month - 1] = s.plannedProgress;
                            actual[s.month - 1] = s.actualProgress;
                        }
                    });
                    setChartData({ planned, actual });
                } else {
                    // Start completely empty if no database snapshot
                    setChartData({ planned: [], actual: [] });
                }
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                setIsLoading(false);
            }
        }
        loadDashboard();
    }, []);

    const adminStats = [
        { name: 'Total Projects', stat: String(stats?.totalProjects ?? '—'), icon: Folder, color: 'text-blue-600', bg: 'bg-blue-100', change: `${stats?.activeProjects ?? 0} active`, changeType: 'increase' },
        { name: 'Active Consultants', stat: String(stats?.activeConsultants ?? '—'), icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', change: 'active', changeType: 'increase' },
        { name: 'Pending Approvals', stat: String(stats?.pendingSubmissions ?? '—'), icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', change: 'submissions', changeType: 'decrease' },
        { name: 'Completion Rate', stat: `${stats?.completionRate ?? 0}%`, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', change: `${stats?.completedProjects ?? 0} completed`, changeType: 'increase' },
    ];

    const zones = ['North Central', 'North East', 'North West', 'South East', 'South South', 'South West'];

    const handleFilterChange = () => {
        // Here you would typically trigger DashboardService with filters
    };

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                    <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {[1, 2].map(i => <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>)}
                </div>
            </div>
        );
    }


    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                        Nationwide Dashboard
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Overview of PTDF projects and performance across Nigeria.
                    </p>
                </div>
                <div className="mt-4 flex gap-3 md:mt-0">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95">
                        <Download className="mr-2 h-4 w-4" /> Export Report
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-lg shadow-indigo-600/20 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 rounded-2xl flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
                </div>
                <select onChange={handleFilterChange} className="text-sm border-gray-300 dark:border-gray-600 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 py-2 pl-3 pr-8 cursor-pointer bg-white dark:bg-gray-700 dark:text-white">
                    <option>All Zones</option>
                    {zones.map(z => <option key={z}>{z}</option>)}
                </select>
                <select onChange={handleFilterChange} className="text-sm border-gray-300 dark:border-gray-600 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 py-2 pl-3 pr-8 cursor-pointer bg-white dark:bg-gray-700 dark:text-white">
                    <option>All Statuses</option>
                    <option>Ongoing</option>
                    <option>Completed</option>
                    <option>Suspended</option>
                </select>
                <input type="month" className="text-sm border-gray-300 dark:border-gray-600 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3 bg-white dark:bg-gray-700 dark:text-white" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {adminStats.map((item) => (
                    <div key={item.name} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.name}</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{item.stat}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${item.bg} dark:bg-opacity-20`}>
                                <item.icon className={`h-6 w-6 ${item.color}`} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            {item.changeType === 'increase' ? (
                                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span className={`text-sm font-medium ${item.changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {item.change}
                            </span>
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 text-nowrap">vs last month</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main KPIs (Chart Placeholder) */}
                <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2 text-indigo-500" />
                            Project Performance Trends
                        </h3>
                        <div className="flex gap-2">
                            <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <span className="w-3 h-3 bg-indigo-500/20 rounded-full mr-1"></span> Planned
                            </span>
                            <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <span className="w-3 h-3 bg-indigo-600 rounded-full mr-1"></span> Actual
                            </span>
                        </div>
                    </div>
                    {/* Simulated Chart Area */}
                    {chartData.planned.length === 0 ? (
                        <div className="h-64 flex items-center justify-center border-b border-l border-gray-100 dark:border-gray-700 text-sm font-medium text-gray-400 dark:text-gray-500 pb-12">
                            No performance trend data available
                        </div>
                    ) : (
                        <>
                            <div className="h-64 flex items-end gap-2 px-2 border-b border-l border-gray-100 dark:border-gray-700">
                                {chartData.planned.map((planned, i) => {
                                    const actual = chartData.actual[i] || 0;
                                    return (
                                        <div key={i} className="flex-1 group relative h-full flex items-end transition-all duration-500">
                                            <div className="absolute bottom-full left-1/2 -ml-4 mb-2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap">
                                                {Math.round(actual)}% Actual
                                            </div>
                                            <div className="w-full flex items-end gap-0.5 relative h-full">
                                                <div
                                                    className="bg-indigo-500/20 rounded-t-sm w-full transition-all duration-700 ease-out"
                                                    style={{ height: `${planned}%` }}
                                                ></div>
                                                <div
                                                    className="bg-indigo-600 rounded-t-sm w-full transition-all duration-700 ease-out group-hover:bg-indigo-500"
                                                    style={{ height: `${actual}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between mt-4 px-2 text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                {MONTH_LABELS.map(m => <span key={m}>{m}</span>)}
                            </div>
                        </>
                    )}
                </div>

                {/* Risk Alerts */}
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                        Critical Risk Alerts
                    </h3>
                    <div className="space-y-4">
                        {riskAlerts.length > 0 ? riskAlerts.map(alert => (
                            <div key={alert.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-l-4 transition-transform hover:scale-[1.02] cursor-pointer" style={{ borderColor: alert.intensity === 'HIGH' || alert.intensity === 'CRITICAL' ? '#ef4444' : alert.intensity === 'MEDIUM' ? '#f59e0b' : '#3b82f6' }}>
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{alert.projectTitle}</h4>
                                    <span className="text-[10px] text-gray-400 font-medium">{timeAgo(alert.createdAt)}</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" /> {alert.location} • {alert.reason}
                                </p>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${alert.intensity === 'HIGH' || alert.intensity === 'CRITICAL' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                        alert.intensity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                        {alert.intensity} Risk
                                    </span>
                                    <button className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 uppercase">View Report</button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No active risk alerts</p>
                        )}
                    </div>
                    <button className="w-full mt-6 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        View All Alerts
                    </button>
                </div>
            </div>

            {/* Bottom Section: Nationwide Clusters & Contractors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Nationwide Project Clusters</h3>
                    <div className="space-y-4">
                        {zoneData.map(zone => (
                            <div key={zone.name} className="group cursor-pointer">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{zone.name}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">{zone.projectCount} Projects</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-indigo-500 h-full rounded-full transition-all duration-1000 group-hover:bg-indigo-400"
                                        style={{ width: `${zone.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top Performing Contractors</h3>
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                                <tr>
                                    <th className="px-3 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contractor</th>
                                    <th className="px-3 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg Rating</th>
                                    <th className="px-3 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Projects</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {topContractors.length > 0 ? topContractors.map((c, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{c.name}</td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center">
                                                <span className="text-yellow-500 mr-1">⭐</span> {c.rating.toFixed(1)}
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-bold">{c.projectCount}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="px-3 py-8 text-sm text-center text-gray-400 dark:text-gray-500">No contractors found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
