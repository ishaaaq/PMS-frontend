import { Folder, AlertTriangle, CheckCircle, Clock, MapPin, TrendingUp, Filter, Download, ArrowUpRight, ArrowDownRight, Users, ShieldCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const adminStats = [
    { name: 'Total Projects', stat: '124', icon: Folder, color: 'text-blue-600', bg: 'bg-blue-100', change: '+12%', changeType: 'increase' },
    { name: 'Active Consultants', stat: '42', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', change: '+3', changeType: 'increase' },
    { name: 'Pending Approvals', stat: '8', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', change: '-2', changeType: 'decrease' },
    { name: 'Completion Rate', stat: '78%', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', change: '+5.4%', changeType: 'increase' },
];

const consultantStats = [
    { name: 'Assigned Projects', stat: '3', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100', change: '0', changeType: 'increase' },
    { name: 'Pending Verifications', stat: '12', icon: ShieldCheck, color: 'text-yellow-600', bg: 'bg-yellow-100', change: '+2', changeType: 'increase' },
    { name: 'Milestone Deadlines', stat: '5', icon: Clock, color: 'text-red-600', bg: 'bg-red-100', change: '-1', changeType: 'decrease' },
    { name: 'Performance Rating', stat: '4.8', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100', change: '+0.2', changeType: 'increase' },
];

const contractorStats = [
    { name: 'Ongoing Projects', stat: '2', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100', change: '0', changeType: 'increase' },
    { name: 'Pending Submissions', stat: '4', icon: CheckCircle, color: 'text-yellow-600', bg: 'bg-yellow-100', change: '+1', changeType: 'increase' },
    { name: 'Budget Utilization', stat: '65%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100', change: '+5%', changeType: 'increase' },
    { name: 'Risk Level', stat: 'Low', icon: AlertTriangle, color: 'text-blue-600', bg: 'bg-blue-100', change: 'Stable', changeType: 'increase' },
];

function getStatsByRole(role: string) {
    switch (role) {
        case 'ADMIN': return adminStats;
        case 'CONSULTANT': return consultantStats;
        case 'CONTRACTOR': return contractorStats;
        default: return adminStats;
    }
}

const riskAlerts = [
    { id: 1, project: 'Construction of School', location: 'Kaduna', intensity: 'High', reason: 'Delayed Materials', time: '2h ago' },
    { id: 2, project: 'Solar Power Plant', location: 'Lagos', intensity: 'Medium', reason: 'Compliance Issue', time: '5h ago' },
    { id: 3, project: 'Bridge Expansion', location: 'Enugu', intensity: 'Low', reason: 'Weather Delay', time: '1d ago' },
];

const zones = ['North Central', 'North East', 'North West', 'South East', 'South South', 'South West'];

export default function DashboardHome() {
    const { user } = useAuth();
    const role = user?.role || 'ADMIN';
    const stats = getStatsByRole(role);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        {role === 'ADMIN' ? 'Nationwide Dashboard' :
                            role === 'CONSULTANT' ? 'Consultant Dashboard' :
                                'Contractor Dashboard'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        {role === 'ADMIN' ? 'Overview of PTDF projects and performance across Nigeria.' :
                            role === 'CONSULTANT' ? 'Manage your assigned projects and verify contractor submissions.' :
                                'Track your project progress and submit milestones for verification.'}
                    </p>
                </div>
                <div className="mt-4 flex gap-3 md:mt-0">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Download className="mr-2 h-4 w-4" /> Export Report
                    </button>
                    {role === 'ADMIN' && (
                        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                            Create Project
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                <select className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                    <option>All Zones</option>
                    {zones.map(z => <option key={z}>{z}</option>)}
                </select>
                <select className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                    <option>All Statuses</option>
                    <option>Ongoing</option>
                    <option>Completed</option>
                    <option>Suspended</option>
                </select>
                <input type="month" className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{item.name}</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{item.stat}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${item.bg}`}>
                                <item.icon className={`h-6 w-6 ${item.color}`} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            {item.changeType === 'increase' ? (
                                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span className={`text-sm font-medium ${item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                                {item.change}
                            </span>
                            <span className="ml-2 text-sm text-gray-500 text-nowrap">vs last month</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main KPIs (Chart Placeholder) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2 text-indigo-500" />
                            Project Performance Trends
                        </h3>
                        <div className="flex gap-2">
                            <span className="flex items-center text-xs text-gray-500">
                                <span className="w-3 h-3 bg-indigo-500 rounded-full mr-1"></span> Planned
                            </span>
                            <span className="flex items-center text-xs text-gray-500">
                                <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span> Actual
                            </span>
                        </div>
                    </div>
                    {/* Simulated Chart Area */}
                    <div className="h-64 relative flex items-end gap-2 px-2 border-b border-l border-gray-100">
                        {[40, 65, 55, 85, 75, 95, 80, 70, 90, 100, 85, 95].map((height, i) => (
                            <div key={i} className="flex-1 group relative">
                                <div className="absolute bottom-full left-1/2 -ms-4 mb-2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {height}%
                                </div>
                                <div
                                    className="bg-indigo-500/20 rounded-t-sm w-full"
                                    style={{ height: `${height * 0.8}%` }}
                                ></div>
                                <div
                                    className="absolute bottom-0 bg-indigo-600 rounded-t-sm w-full transition-all duration-500 group-hover:bg-indigo-400"
                                    style={{ height: `${height * 0.6}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 px-2 text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                    </div>
                </div>

                {/* Risk Alerts */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                        Critical Risk Alerts
                    </h3>
                    <div className="space-y-4">
                        {riskAlerts.map(alert => (
                            <div key={alert.id} className="p-4 rounded-lg bg-gray-50 border-l-4 transition-transform hover:scale-[1.02] cursor-pointer" style={{ borderColor: alert.intensity === 'High' ? '#ef4444' : alert.intensity === 'Medium' ? '#f59e0b' : '#3b82f6' }}>
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-sm text-gray-900">{alert.project}</h4>
                                    <span className="text-[10px] text-gray-400 font-medium">{alert.time}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" /> {alert.location} • {alert.reason}
                                </p>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${alert.intensity === 'High' ? 'bg-red-100 text-red-700' :
                                        alert.intensity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {alert.intensity} Risk
                                    </span>
                                    <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase">View Report</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        View All Alerts
                    </button>
                </div>
            </div>

            {/* Bottom Section: Role-specific lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {role === 'ADMIN' ? (
                    <>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Nationwide Project Clusters</h3>
                            <div className="space-y-4">
                                {zones.map(zone => (
                                    <div key={zone} className="group cursor-pointer">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-gray-700">{zone}</span>
                                            <span className="text-xs text-gray-500 font-bold">{Math.floor(Math.random() * 20) + 5} Projects</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-indigo-500 h-full rounded-full transition-all duration-1000 group-hover:bg-indigo-400"
                                                style={{ width: `${Math.random() * 60 + 20}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performing Contractors</h3>
                            <div className="overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-3 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contractor</th>
                                            <th className="px-3 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg Rating</th>
                                            <th className="px-3 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Projects</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {[
                                            { name: 'BuildRight Construction', rating: 4.9, count: 12 },
                                            { name: 'Quantum Solutions', rating: 4.7, count: 8 },
                                            { name: 'GreenEnergy Ltd', rating: 4.5, count: 5 },
                                            { name: 'Aether Innovations', rating: 4.2, count: 10 }
                                        ].map((c, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors cursor-pointer">
                                                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <span className="text-yellow-500 mr-1">⭐</span> {c.rating}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">{c.count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Assigned Projects for Consultants/Contractors */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">My Assigned Projects</h3>
                            <div className="space-y-4">
                                {[
                                    { title: 'ICT Center Construction', progress: 45, status: 'Ongoing', location: 'Lagos' },
                                    { title: 'Solar Power Plant', progress: 12, status: 'Ongoing', location: 'Kano' },
                                    { title: 'Bridge Expansion', progress: 85, status: 'Ongoing', location: 'Enugu' },
                                ].map((project, i) => (
                                    <div key={i} className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-900">{project.title}</h4>
                                                <p className="text-[10px] text-gray-500">{project.location}</p>
                                            </div>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold uppercase">
                                                {project.status}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                                            <div
                                                className="bg-indigo-600 h-full rounded-full group-hover:bg-indigo-500 transition-all"
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-[10px] text-gray-400 font-medium">Progress</span>
                                            <span className="text-[10px] text-gray-900 font-bold">{project.progress}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Actions/Requests */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">
                                {role === 'CONSULTANT' ? 'Verification Requests' : 'Upcoming Milestones'}
                            </h3>
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-indigo-100 p-2 rounded-lg">
                                                <Folder className="h-4 w-4 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {role === 'CONSULTANT' ? 'Milestone Proof Submission' : 'Foundation Completion'}
                                                </p>
                                                <p className="text-[10px] text-gray-500">Project #{100 + i} • 2d left</p>
                                            </div>
                                        </div>
                                        <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase px-3 py-1 bg-indigo-50 rounded-md">
                                            {role === 'CONSULTANT' ? 'Review' : 'View'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors uppercase tracking-wider text-[10px] font-bold">
                                View Full Queue
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
