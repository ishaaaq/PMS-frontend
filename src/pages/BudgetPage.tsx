
import { TrendingUp, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';

export default function BudgetPage() {
    const budgetStats = [
        { label: 'Total Allocated', amount: '₦14.2B', change: '+2.4%', type: 'up' },
        { label: 'Total Disbursed', amount: '₦8.1B', change: '+12.1%', type: 'up' },
        { label: 'Actual Expenditure', amount: '₦6.5B', change: '+5.4%', type: 'up' },
        { label: 'Remaining Balance', amount: '₦6.1B', change: '-1.4%', type: 'down' },
    ];

    const RecentDisbursements = [
        { id: 1, project: 'Lagos ICT Hub', amount: '₦45M', date: '2026-01-20', status: 'Completed' },
        { id: 2, project: 'Kaduna School', amount: '₦12M', date: '2026-01-18', status: 'Pending' },
        { id: 3, project: 'Enugu Road', amount: '₦88M', date: '2026-01-15', status: 'Completed' },
    ];

    return (
        <div className="space-y-8">
            <div className="md:flex md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Financial Oversight</h2>
                    <p className="mt-1 text-sm text-gray-500 italic text-nowrap">Manage nationwide fund allocation and expenditure.</p>
                </div>
                <div className="mt-4 flex gap-3 md:mt-0">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all active:scale-95">
                        <Download className="mr-2 h-4 w-4" /> Audit Log
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-all active:scale-95">
                        Initiate Disbursement
                    </button>
                </div>
            </div>

            {/* Financial Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {budgetStats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-2xl font-bold text-gray-900">{stat.amount}</span>
                            <span className={`text-xs font-bold flex items-center ${stat.type === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                {stat.type === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Expenditure Chart Placeholder */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-gray-900 uppercase flex items-center tracking-widest">
                            <TrendingUp className="h-4 w-4 mr-2 text-green-500" /> Disbursement vs Expenditure
                        </h3>
                        <select className="text-xs border-gray-200 rounded-lg p-1">
                            <option>Last 6 Months</option>
                            <option>Year to Date</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-end gap-4 px-4 border-b border-gray-100 pb-1">
                        {[50, 70, 45, 90, 65, 80].map((h, i) => (
                            <div key={i} className="flex-1 flex gap-1 items-end">
                                <div className="flex-1 bg-green-500/20 rounded-t-sm" style={{ height: `${h}%` }}></div>
                                <div className="flex-1 bg-green-600 rounded-t-sm" style={{ height: `${h * 0.7}%` }}></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-3 text-[10px] font-bold text-gray-400 uppercase px-4">
                        <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                    </div>
                </div>

                {/* Recent Disbursements */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Recent Disbursements</h3>
                    <div className="space-y-4">
                        {RecentDisbursements.map(d => (
                            <div key={d.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{d.project}</p>
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{d.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-green-600">{d.amount}</p>
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${d.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {d.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2 text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest border border-gray-100 rounded-lg transition-colors">
                        View Full Ledger
                    </button>
                </div>
            </div>
        </div>
    );
}
